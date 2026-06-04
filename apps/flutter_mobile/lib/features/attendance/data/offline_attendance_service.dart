import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'dart:io';
import 'package:flutter/foundation.dart';

class OfflineAttendanceService {
  static Database? _database;

  Future<Database?> get database async {
    if (kIsWeb) return null;
    if (_database != null) return _database!;
    _database = await _initDB();
    return _database!;
  }

  Future<Database> _initDB() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'offline_attendance.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE pending_attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employeeId TEXT,
            latitude REAL,
            longitude REAL,
            clockType TEXT,
            notes TEXT,
            photoPath TEXT,
            timestamp TEXT
          )
        ''');
      },
    );
  }

  Future<void> savePendingAttendance({
    required String employeeId,
    required double latitude,
    required double longitude,
    required String clockType,
    required String notes,
    required String photoPath,
  }) async {
    final db = await database;
    if (db == null) return; // Ignore on Web
    await db.insert('pending_attendance', {
      'employeeId': employeeId,
      'latitude': latitude,
      'longitude': longitude,
      'clockType': clockType,
      'notes': notes,
      'photoPath': photoPath,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  Future<List<Map<String, dynamic>>> getPendingAttendances() async {
    final db = await database;
    if (db == null) return []; // Ignore on Web
    return await db.query('pending_attendance');
  }

  Future<void> removePendingAttendance(int id) async {
    final db = await database;
    if (db == null) return;
    
    // Attempt to delete local photo if it exists
    try {
      final records = await db.query('pending_attendance', where: 'id = ?', whereArgs: [id]);
      if (records.isNotEmpty) {
        final path = records.first['photoPath'] as String?;
        if (path != null && File(path).existsSync()) {
          File(path).deleteSync();
        }
      }
    } catch (e) {
      debugPrint('Warning: Failed to delete local photo for pending attendance $id. Error: $e');
    }

    await db.delete('pending_attendance', where: 'id = ?', whereArgs: [id]);
  }
}
