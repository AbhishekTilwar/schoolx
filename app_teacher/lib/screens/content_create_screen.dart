import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ContentCreateScreen extends StatefulWidget {
  const ContentCreateScreen({super.key});

  @override
  State<ContentCreateScreen> createState() => _ContentCreateScreenState();
}

class _ContentCreateScreenState extends State<ContentCreateScreen> {
  String _type = 'ASSIGNMENT';
  String _tag = 'HOMEWORK';
  final _title = TextEditingController();
  final _body = TextEditingController();
  String? _branchId;
  String? _sectionId;
  List<dynamic> _branches = [];
  List<dynamic> _sections = [];

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final branches = await ApiService.instance.get('/admin/branches') as List;
    final sections = await ApiService.instance.get('/admin/sections') as List;
    setState(() {
      _branches = branches;
      _sections = sections;
      if (branches.isNotEmpty) _branchId = branches[0]['id'];
      if (sections.isNotEmpty) _sectionId = sections[0]['id'];
    });
  }

  Future<void> _publish() async {
    if (_branchId == null || _title.text.trim().isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Branch and title are required')),
        );
      }
      return;
    }
    final audiences = <Map<String, String>>[];
    if (_sectionId != null) {
      audiences.add({'audienceType': 'section', 'audienceId': _sectionId!});
    } else {
      audiences.add({'audienceType': 'branch', 'audienceId': _branchId!});
    }
    try {
      await ApiService.instance.post('/content', {
        'branchId': _branchId,
        'type': _type,
        'tags': [_tag],
        'title': _title.text.trim(),
        'body': _body.text,
        'status': 'published',
        'audiences': audiences,
      });
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create content')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          DropdownButtonFormField(
            value: _type,
            decoration: const InputDecoration(labelText: 'Type'),
            items: const [
              DropdownMenuItem(value: 'ASSIGNMENT', child: Text('Assignment')),
              DropdownMenuItem(value: 'BROADCAST', child: Text('Broadcast')),
              DropdownMenuItem(value: 'ASSESSMENT', child: Text('Assessment')),
            ],
            onChanged: (v) => setState(() {
              _type = v!;
              _tag = v == 'ASSIGNMENT' ? 'HOMEWORK' : v == 'BROADCAST' ? 'NOTICE' : 'UNIT_TEST';
            }),
          ),
          DropdownButtonFormField(
            value: _tag,
            decoration: const InputDecoration(labelText: 'Tag'),
            items: (_type == 'ASSIGNMENT'
                    ? ['HOMEWORK', 'CLASSWORK', 'WORKSHEET']
                    : _type == 'BROADCAST'
                        ? ['NOTICE', 'ANNOUNCEMENT', 'URGENT']
                        : ['UNIT_TEST', 'EXAM'])
                .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                .toList(),
            onChanged: (v) => setState(() => _tag = v!),
          ),
          DropdownButtonFormField(
            value: _sectionId,
            decoration: const InputDecoration(labelText: 'Section'),
            items: _sections
                .map((s) => DropdownMenuItem(value: s['id'], child: Text(s['label'] ?? s['name'])))
                .toList(),
            onChanged: (v) => setState(() => _sectionId = v as String?),
          ),
          TextField(controller: _title, decoration: const InputDecoration(labelText: 'Title')),
          TextField(controller: _body, decoration: const InputDecoration(labelText: 'Body'), maxLines: 4),
          FilledButton(onPressed: _publish, child: const Text('Publish')),
        ],
      ),
    );
  }
}
