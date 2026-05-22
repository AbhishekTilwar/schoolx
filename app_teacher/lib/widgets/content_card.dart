import 'package:flutter/material.dart';

class ContentCard extends StatelessWidget {
  final Map<String, dynamic> item;
  final VoidCallback? onTap;

  const ContentCard({super.key, required this.item, this.onTap});

  @override
  Widget build(BuildContext context) {
    final tags = (item['tags'] as List?)?.cast<String>() ?? [];
    final type = item['type'] as String? ?? '';
    final tag = tags.isNotEmpty ? tags.first : type;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _chip(tag),
                  const Spacer(),
                  Text(item['status'] ?? '', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                ],
              ),
              const SizedBox(height: 8),
              Text(item['title'] ?? '', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              if (item['subjectName'] != null)
                Text(item['subjectName'], style: const TextStyle(color: Colors.grey, fontSize: 13)),
              if (item['authorName'] != null)
                Text('By ${item['authorName']}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _chip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFEFF6FF),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF2563EB), fontWeight: FontWeight.w600)),
    );
  }
}
