import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ScheduleScreen extends StatefulWidget {
  const ScheduleScreen({super.key});

  @override
  State<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> {
  List<dynamic> _slots = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final slots = await ApiService.instance.get('/timetable/me') as List;
    setState(() => _slots = slots);
  }

  @override
  Widget build(BuildContext context) {
    if (_slots.isEmpty) {
      return const Center(child: Text('No timetable'));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _slots.length,
      itemBuilder: (_, i) {
        final s = _slots[i] as Map<String, dynamic>;
        return Card(
          child: ListTile(
            title: Text(s['subject'] ?? ''),
            subtitle: Text('Day ${s['dayOfWeek']} · ${s['startTime']} - ${s['endTime']}'),
            trailing: Text('P${s['period']}'),
          ),
        );
      },
    );
  }
}
