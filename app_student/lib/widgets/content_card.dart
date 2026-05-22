import 'package:flutter/material.dart';

class ContentCard extends StatelessWidget {
  final Map<String, dynamic> item;
  final VoidCallback? onTap;
  const ContentCard({super.key, required this.item, this.onTap});

  @override
  Widget build(BuildContext context) {
    final tags = (item['tags'] as List?)?.cast<String>() ?? [];
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        onTap: onTap,
        title: Text(item['title'] ?? ''),
        subtitle: Text('${item['type']} · ${tags.join(', ')}'),
        trailing: item['dueAt'] != null ? const Icon(Icons.schedule, size: 18) : null,
      ),
    );
  }
}
