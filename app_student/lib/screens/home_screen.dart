import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../widgets/content_card.dart';

class HomeScreen extends StatefulWidget {
  final Map<String, dynamic> user;
  final void Function(int tab) onNavigate;

  const HomeScreen({super.key, required this.user, required this.onNavigate});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> _recentContent = [];
  Map<String, dynamic>? _attendance;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final contentRes = await ApiService.instance.get('/content?limit=5');
      final attendance = await ApiService.instance.get('/attendance/me');
      setState(() {
        _recentContent = contentRes['data'] as List? ?? [];
        _attendance = attendance as Map<String, dynamic>?;
      });
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final section = widget.user['student']?['section'] ?? '—';
    final summary = _attendance?['summary'] as Map<String, dynamic>?;

    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Hello, ${widget.user['fullName']}', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          Chip(label: Text(section)),
          if (_error != null) Padding(padding: const EdgeInsets.only(top: 8), child: Text(_error!, style: const TextStyle(color: Colors.red))),
          if (summary != null) ...[
            const SizedBox(height: 16),
            Card(
              child: ListTile(
                title: const Text('Attendance'),
                trailing: Text('${summary['percentage'] ?? 0}%'),
                subtitle: Text('${summary['present']}/${summary['total']} present'),
              ),
            ),
          ],
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Recent from school', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              TextButton(onPressed: () => widget.onNavigate(1), child: const Text('See all')),
            ],
          ),
          if (_recentContent.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Text('No content published yet.'),
              ),
            )
          else
            ..._recentContent.map((item) => ContentCard(
                  item: item as Map<String, dynamic>,
                  onTap: () => widget.onNavigate(1),
                )),
        ],
      ),
    );
  }
}
