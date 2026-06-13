import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart' show Colors;
import 'package:flutter/painting.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as path;
import 'package:intl/intl.dart';

class WatermarkService {
  /// Menambahkan stempel permanen ke foto:
  /// - Atas Kiri: Tanggal, Jam, ID, Nama
  /// - Atas Kanan: "Check In" atau "Check Out"
  /// - Bawah Kiri: Nama Toko, Alamat, LongLat
  /// - Bawah Kanan: Logo WKN + Teks "WKN Enterprise Verified"
  static Future<File> addWatermark({
    required File imageFile,
    required String employeeName,
    required String employeeId,
    required double latitude,
    required double longitude,
    required String address,
    required bool isCheckOut,
    String? storeName,
    String? customLabel,
  }) async {
    final bytes = await imageFile.readAsBytes();
    final ui.Codec codec = await ui.instantiateImageCodec(bytes);
    final ui.FrameInfo frame = await codec.getNextFrame();
    final ui.Image originalImage = frame.image;

    final int imgWidth = originalImage.width;
    final int imgHeight = originalImage.height;

    final recorder = ui.PictureRecorder();
    final canvas = Canvas(recorder, Rect.fromLTWH(0, 0, imgWidth.toDouble(), imgHeight.toDouble()));

    canvas.drawImage(originalImage, Offset.zero, Paint());

    // 1. Load Merek Baru (Logo Watermark)
    ui.Image? logoImage;
    try {
      final ByteData data = await rootBundle.load('assets/wkn_logo_square.png');
      final ui.Codec logoCodec = await ui.instantiateImageCodec(data.buffer.asUint8List());
      final ui.FrameInfo logoFrame = await logoCodec.getNextFrame();
      logoImage = logoFrame.image;
    } catch (e) {
      debugPrint("Gagal memuat logo: $e");
    }

    // 2. Parameter Styling (Dipadatkan ke sudut & diperbesar)
    final double padding = imgWidth * 0.02; // Lebih rapat ke tepi (0.02)
    final double fontSize = imgWidth * 0.028; // Diperbesar dari 0.024
    final double smallFontSize = fontSize * 0.85;
    final double logoSize = imgWidth * 0.14; // Logo diperbesar proporsional

    final textStyle = TextStyle(
      color: Colors.white,
      fontSize: fontSize,
      fontWeight: FontWeight.bold,
      shadows: [
        const Shadow(blurRadius: 6.0, color: Colors.black, offset: Offset(2, 2)),
      ],
    );

    final smallTextStyle = textStyle.copyWith(
      fontSize: smallFontSize,
      fontWeight: FontWeight.normal,
    );

    void drawTextBlock(List<String> lines, double x, double y, ui.TextAlign align, TextStyle baseStyle) {
      for (int i = 0; i < lines.length; i++) {
        final tp = TextPainter(
          text: TextSpan(text: lines[i], style: baseStyle),
          textDirection: ui.TextDirection.ltr,
          textAlign: align,
        );
        tp.layout(maxWidth: imgWidth * 0.7);
        
        double drawX = x;
        if (align == ui.TextAlign.right) {
          drawX = x - tp.width;
        }
        
        tp.paint(canvas, Offset(drawX, y));
        y += tp.height + (fontSize * 0.2);
      }
    }

    // --- ATAS KIRI: Tanggal, Jam, ID, Nama ---
    final String dateStr = DateFormat('EEEE, dd MMM yyyy', 'id_ID').format(DateTime.now());
    final String timeStr = DateFormat('HH:mm:ss').format(DateTime.now());
    drawTextBlock(
      [
        "$dateStr | $timeStr WIB",
        "[$employeeId] $employeeName".toUpperCase(),
      ],
      padding,
      padding,
      ui.TextAlign.left,
      textStyle,
    );

    // --- ATAS KANAN: Check In / Check Out atau Custom Label ---
    final String statusText = customLabel ?? (isCheckOut ? "CHECK OUT" : "CHECK IN");
    final Color statusColor = customLabel != null 
        ? const Color(0xFF2563EB) // Primary Blue for Leave/Permission
        : (isCheckOut ? const Color(0xFFFF3B30) : const Color(0xFF34C759));

    final tpStatus = TextPainter(
      text: TextSpan(
        text: statusText.toUpperCase(),
        style: textStyle.copyWith(
          fontSize: fontSize * (customLabel != null ? 1.2 : 1.6),
          color: statusColor,
          fontWeight: FontWeight.w900,
          shadows: [
             Shadow(blurRadius: 10.0, color: Colors.black.withAlpha(128), offset: const Offset(2, 2)),
          ]
        ),
      ),
      textDirection: ui.TextDirection.ltr,
    );
    tpStatus.layout();
    tpStatus.paint(canvas, Offset(imgWidth - tpStatus.width - padding, padding));

    // --- BAWAH KIRI: Nama Toko, Alamat, LongLat ---
    final String locationName = (storeName ?? "WKN - TITIK ABSEN UMUM").toUpperCase();
    final String coords = "GPS: ${latitude.toStringAsFixed(6)}, ${longitude.toStringAsFixed(6)}";
    
    final List<String> bottomLines = [locationName, address, coords];
    double bottomY = imgHeight - (smallFontSize * 4) - padding;
    
    drawTextBlock(
      bottomLines,
      padding,
      bottomY,
      ui.TextAlign.left,
      smallTextStyle.copyWith(fontWeight: FontWeight.w600),
    );

    // --- BAWAH KANAN: Logo + "WKN Mobile Verified" ---
    // Layout teks terlebih dahulu untuk menghitung lebar & posisi
    final tpVerify = TextPainter(
      text: TextSpan(
        text: "WKN Mobile Verified",
        style: textStyle.copyWith(
          fontSize: smallFontSize * 0.9,
          letterSpacing: 1.2,
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
      ),
      textDirection: ui.TextDirection.ltr,
    );
    tpVerify.layout();

    // Hitung posisi: Teks rata kanan dengan padding
    final double textRightEdge = imgWidth - padding;
    final double textX = textRightEdge - tpVerify.width;
    final double textY = imgHeight - tpVerify.height - padding;

    // Gambar teks
    tpVerify.paint(canvas, Offset(textX, textY));

    // Gambar Logo TEPAT di tengah teks — tanpa filter monochrome (full color)
    if (logoImage != null) {
      // Tengah horizontal teks = textX + (tpVerify.width / 2)
      final double textCenterX = textX + (tpVerify.width / 2);
      final double logoCenterX = textCenterX - (logoSize / 2);
      final double logoY = textY - logoSize - (padding * 0.4);

      canvas.drawImageRect(
        logoImage,
        Rect.fromLTWH(0, 0, logoImage.width.toDouble(), logoImage.height.toDouble()),
        Rect.fromLTWH(logoCenterX, logoY, logoSize, logoSize),
        Paint()
          ..filterQuality = ui.FilterQuality.high
          ..colorFilter = const ColorFilter.matrix(<double>[
            0.2126, 0.7152, 0.0722, 0, 0,
            0.2126, 0.7152, 0.0722, 0, 0,
            0.2126, 0.7152, 0.0722, 0, 0,
            0,      0,      0,      1, 0,
          ]), // Filter monokrom
      );
    }

    final ui.Picture picture = recorder.endRecording();
    final ui.Image watermarkedImage = await picture.toImage(imgWidth, imgHeight);
    final byteData = await watermarkedImage.toByteData(format: ui.ImageByteFormat.png);
    final watermarkedBytes = byteData!.buffer.asUint8List();

    final tempDir = await getTemporaryDirectory();
    final outputPath = path.join(tempDir.path, 'wkn_verified_${DateTime.now().millisecondsSinceEpoch}.png');
    final outputFile = File(outputPath);
    await outputFile.writeAsBytes(watermarkedBytes);

    return outputFile;
  }
}
