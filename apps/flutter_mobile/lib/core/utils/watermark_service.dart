import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart' show Colors;
import 'package:flutter/painting.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as path;
import 'package:intl/intl.dart';
import 'package:geocoding/geocoding.dart';
import 'package:ntp/ntp.dart';

class WatermarkService {
  /// Menambahkan stempel permanen ke foto:
  /// - Atas Kiri: Tanggal, Jam, ID, Nama
  /// - Atas Kanan: "Check In" atau "Check Out"
  /// - Bawah Kiri: Nama Toko, Alamat, LongLat
  /// - Bawah Kanan: Logo WKN + Teks "WNKSite Mobile"
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

    // --- 0. Sabuk Transparan (Shadow Gradient Bar) ---
    // Atas
    final Paint shadowPaintTop = Paint()
      ..shader = ui.Gradient.linear(
        const Offset(0, 0),
        Offset(0, imgHeight * 0.25),
        [Colors.black.withValues(alpha: 0.7), Colors.transparent],
      );
    canvas.drawRect(Rect.fromLTWH(0, 0, imgWidth.toDouble(), imgHeight * 0.25), shadowPaintTop);

    // Bawah
    final Paint shadowPaintBottom = Paint()
      ..shader = ui.Gradient.linear(
        Offset(0, imgHeight.toDouble()),
        Offset(0, imgHeight * 0.75),
        [Colors.black.withValues(alpha: 0.8), Colors.transparent],
      );
    canvas.drawRect(Rect.fromLTWH(0, imgHeight * 0.75, imgWidth.toDouble(), imgHeight * 0.25), shadowPaintBottom);

    // 1. Load Merek Baru (Logo Watermark)
    ui.Image? logoImage;
    try {
      final ByteData data = await rootBundle.load('assets/wkn_logo.png');
      final ui.Codec logoCodec = await ui.instantiateImageCodec(data.buffer.asUint8List());
      final ui.FrameInfo logoFrame = await logoCodec.getNextFrame();
      logoImage = logoFrame.image;
    } catch (e) {
      debugPrint("Gagal memuat logo: $e");
    }

    // 2. Parameter Styling
    final double padding = imgWidth * 0.025; 
    final double fontSize = imgWidth * 0.028; 
    final double smallFontSize = fontSize * 0.85;
    final double logoSize = imgWidth * 0.14; 

    final textStyle = TextStyle(
      color: Colors.white,
      fontSize: fontSize,
      fontWeight: FontWeight.bold,
      shadows: [
        const Shadow(blurRadius: 4.0, color: Colors.black, offset: Offset(1, 1)),
      ],
    );

    final smallTextStyle = textStyle.copyWith(
      fontSize: smallFontSize,
      fontWeight: FontWeight.normal,
    );

    void drawTextBlock(List<TextSpan> lines, double x, double y, ui.TextAlign align) {
      for (int i = 0; i < lines.length; i++) {
        final tp = TextPainter(
          text: lines[i],
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

    // --- Geocoding Alamat Asli (Nama Jalan) ---
    String displayAddress = address;
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(latitude, longitude);
      if (placemarks.isNotEmpty) {
        Placemark place = placemarks.first;
        final parts = [place.street, place.subLocality, place.locality]
            .where((e) => e != null && e.isNotEmpty)
            .toList();
        if (parts.isNotEmpty) {
          displayAddress = parts.join(', ');
        }
      }
    } catch (e) {
      debugPrint("Geocoding error: $e");
    }

    // --- Keamanan Waktu (NTP Anti-Fraud Time) ---
    DateTime now = DateTime.now();
    bool isNetworkTime = false;
    try {
      now = await NTP.now(timeout: const Duration(seconds: 3));
      isNetworkTime = true;
    } catch (e) {
      debugPrint("Gagal mengambil waktu NTP: $e");
    }

    // --- ATAS KIRI: Hari, Tanggal, Jam, ID, Nama ---
    final String dateStr = DateFormat('EEEE, dd MMMM yyyy', 'id_ID').format(now);
    final String timeStr = DateFormat('HH:mm:ss').format(now);
    final String timeZoneStatus = isNetworkTime ? "WIB (Server Verified)" : "WIB (Lokal)";

    drawTextBlock(
      [
        TextSpan(text: "$dateStr | $timeStr $timeZoneStatus", style: textStyle.copyWith(color: isNetworkTime ? Colors.greenAccent : Colors.orangeAccent, fontSize: smallFontSize, fontWeight: FontWeight.bold)),
        TextSpan(text: employeeId.toUpperCase(), style: textStyle.copyWith(fontWeight: FontWeight.w400)), // Tipis
        TextSpan(text: employeeName.toUpperCase(), style: textStyle.copyWith(fontWeight: FontWeight.w900, fontSize: fontSize * 1.2)), // Sangat Tebal
      ],
      padding,
      padding,
      ui.TextAlign.left,
    );

    // --- ATAS KANAN: Check In / Check Out atau Custom Label ---
    final String statusText = customLabel ?? (isCheckOut ? "CHECK OUT" : "CHECK IN");
    final Color statusColor = Colors.white;

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

    // --- BAWAH KIRI: Nama Toko, Alamat (Jalan), LongLat ---
    final String locationName = (storeName ?? "WKN - TITIK ABSEN UMUM").toUpperCase();
    final String coords = "GPS: ${latitude.toStringAsFixed(6)}, ${longitude.toStringAsFixed(6)}";
    
    drawTextBlock(
      [
        TextSpan(text: locationName, style: smallTextStyle.copyWith(fontWeight: FontWeight.w900, color: Colors.amberAccent)),
        TextSpan(text: displayAddress, style: smallTextStyle.copyWith(fontWeight: FontWeight.w600)),
        TextSpan(text: coords, style: smallTextStyle.copyWith(fontFamily: 'monospace', fontWeight: FontWeight.w500, color: Colors.grey[300])),
      ],
      padding,
      imgHeight - (smallFontSize * 4) - padding,
      ui.TextAlign.left,
    );

    // --- BAWAH KANAN: Logo WKN + Teks "WNKSite Mobile" ---
    if (logoImage != null) {
      final double aspectRatio = logoImage.width / logoImage.height;
      double logoW = logoSize;
      double logoH = logoSize;
      
      if (aspectRatio > 1) {
        logoH = logoSize / aspectRatio;
      } else {
        logoW = logoSize * aspectRatio;
      }

      final double textHeight = smallFontSize * 1.5;
      final double logoX = imgWidth - logoW - padding;
      final double logoY = imgHeight - logoH - padding - textHeight;

      canvas.drawImageRect(
        logoImage,
        Rect.fromLTWH(0, 0, logoImage.width.toDouble(), logoImage.height.toDouble()),
        Rect.fromLTWH(logoX, logoY, logoW, logoH),
        Paint()
          ..filterQuality = ui.FilterQuality.high
          ..colorFilter = const ColorFilter.matrix(<double>[
            0, 0, 0, 0, 255, // R -> 255 (White)
            0, 0, 0, 0, 255, // G -> 255 (White)
            0, 0, 0, 0, 255, // B -> 255 (White)
            0, 0, 0, 1, 0,   // Alpha (Keep original alpha)
          ]),
      );

      final String logoText = "WNKSite Mobile";
      final tpLogoText = TextPainter(
        text: TextSpan(
          text: logoText, 
          style: smallTextStyle.copyWith(
            fontWeight: FontWeight.w900, 
            letterSpacing: 2.0, // Tipografi Premium
            color: Colors.white.withValues(alpha: 0.9)
          )
        ),
        textDirection: ui.TextDirection.ltr,
        textAlign: ui.TextAlign.right,
      );
      tpLogoText.layout();
      tpLogoText.paint(canvas, Offset(imgWidth - tpLogoText.width - padding, logoY + logoH + (smallFontSize * 0.2)));
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
