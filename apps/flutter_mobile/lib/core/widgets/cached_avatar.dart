import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../utils/constants.dart';

class CachedAvatar extends StatelessWidget {
  final String? imageUrl;
  final String name;
  final double radius;
  final double fontSize;
  final Color? backgroundColor;

  const CachedAvatar({
    super.key,
    this.imageUrl,
    required this.name,
    this.radius = 20,
    this.fontSize = 14,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final String initial = name.isNotEmpty ? name.substring(0, 1).toUpperCase() : 'U';
    final bgColor = backgroundColor ?? AppConstants.primaryColor.withValues(alpha: 0.1);
    final textColor = backgroundColor != null ? Colors.white : AppConstants.primaryColor;

    if (imageUrl == null || imageUrl!.isEmpty) {
      return CircleAvatar(
        radius: radius,
        backgroundColor: bgColor,
        child: Text(
          initial,
          style: TextStyle(
            color: textColor,
            fontSize: fontSize,
            fontWeight: FontWeight.bold,
          ),
        ),
      );
    }

    return CachedNetworkImage(
      imageUrl: imageUrl!,
      imageBuilder: (context, imageProvider) => CircleAvatar(
        radius: radius,
        backgroundImage: imageProvider,
      ),
      placeholder: (context, url) => CircleAvatar(
        radius: radius,
        backgroundColor: Colors.grey.shade200,
        child: const CircularProgressIndicator(strokeWidth: 2),
      ),
      errorWidget: (context, url, error) => CircleAvatar(
        radius: radius,
        backgroundColor: bgColor,
        child: Text(
          initial,
          style: TextStyle(
            color: textColor,
            fontSize: fontSize,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
