import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  List<dynamic> _students = [];
  String? _sectionId;
  List<dynamic> _sections = [];
  final Map<String, String> _status = {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final sections = await ApiService.instance.get('/admin/sections') as List;
    setState(() {
      _sections = sections;
      _sectionId = sections.isNotEmpty ? sections[0]['id'] : null;
    });
    await _loadStudents();
  }

  Future<void> _loadStudents() async {
    if (_sectionId == null) return;
    setState(() => _loading = true);
    final students = await ApiService.instance.get('/attendance/sections/$_sectionId/students') as List;
    for (final s in students) {
      _status[s['id']] = 'present';
    }
    setState(() {
      _students = students;
      _loading = false;
    });
  }

  Future<void> _save() async {
    final user = await ApiService.instance.savedUser;
    final branchId = (user?['branchIds'] as List?)?.first;
    await ApiService.instance.post('/attendance/sessions', {
      'sectionId': _sectionId,
      'branchId': branchId,
      'date': DateTime.now().toIso8601String().split('T').first,
      'records': _students.map((s) => {'studentId': s['id'], 'status': _status[s['id']] ?? 'present'}).toList(),
    });
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Attendance saved')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mark attendance')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: DropdownButtonFormField(
                    value: _sectionId,
                    decoration: const InputDecoration(labelText: 'Section'),
                    items: _sections
                        .map((s) => DropdownMenuItem(value: s['id'], child: Text(s['label'] ?? '')))
                        .toList(),
                    onChanged: (v) async {
                      setState(() => _sectionId = v as String?);
                      await _loadStudents();
                    },
                  ),
                ),
                Expanded(
                  child: ListView.builder(
                    itemCount: _students.length,
                    itemBuilder: (_, i) {
                      final s = _students[i] as Map<String, dynamic>;
                      final id = s['id'] as String;
                      return ListTile(
                        title: Text('${s['firstName']} ${s['lastName']}'),
                        subtitle: Text(s['admissionNo'] ?? ''),
                        trailing: DropdownButton<String>(
                          value: _status[id] ?? 'present',
                          items: const [
                            DropdownMenuItem(value: 'present', child: Text('Present')),
                            DropdownMenuItem(value: 'absent', child: Text('Absent')),
                            DropdownMenuItem(value: 'late', child: Text('Late')),
                          ],
                          onChanged: (v) => setState(() => _status[id] = v!),
                        ),
                      );
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: FilledButton(onPressed: _save, child: const Text('Save attendance')),
                ),
              ],
            ),
    );
  }
}
