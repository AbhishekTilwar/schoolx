import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ContentDetailScreen extends StatefulWidget {
  final String contentId;
  const ContentDetailScreen({super.key, required this.contentId});

  @override
  State<ContentDetailScreen> createState() => _ContentDetailScreenState();
}

class _ContentDetailScreenState extends State<ContentDetailScreen> {
  Map<String, dynamic>? _item;
  final _answer = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final item = await ApiService.instance.get('/content/${widget.contentId}');
    setState(() => _item = item as Map<String, dynamic>);
  }

  Future<void> _submit() async {
    await ApiService.instance.post('/content/${widget.contentId}/submissions', {'textAnswer': _answer.text});
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Submitted!')));
      _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_item == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    final tags = (_item!['tags'] as List?)?.cast<String>() ?? [];
    final canSubmit = _item!['type'] == 'ASSIGNMENT' && tags.contains('HOMEWORK');

    return Scaffold(
      appBar: AppBar(title: Text(_item!['title'] ?? 'Content')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(_item!['body'] ?? '', style: const TextStyle(fontSize: 15)),
          if (_item!['dueAt'] != null) ...[
            const SizedBox(height: 12),
            Text('Due: ${_item!['dueAt']}', style: const TextStyle(color: Colors.grey)),
          ],
          if (canSubmit) ...[
            const SizedBox(height: 24),
            TextField(controller: _answer, decoration: const InputDecoration(labelText: 'Your answer'), maxLines: 4),
            FilledButton(onPressed: _submit, child: const Text('Submit')),
          ],
        ],
      ),
    );
  }
}
