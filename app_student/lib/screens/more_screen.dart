import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AttendanceTab extends StatefulWidget {
  const AttendanceTab({super.key});
  @override
  State<AttendanceTab> createState() => _AttendanceTabState();
}

class _AttendanceTabState extends State<AttendanceTab> {
  Map<String, dynamic>? _data;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final d = await ApiService.instance.get('/attendance/me');
      setState(() => _data = d as Map<String, dynamic>);
    } catch (e) {
      setState(() => _error = e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));
    if (_data == null) return const Center(child: CircularProgressIndicator());
    final s = _data!['summary'] as Map<String, dynamic>?;
    final records = _data!['records'] as List? ?? [];
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (s != null)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Text(
                  'Attendance: ${s['percentage'] ?? 0}% (${s['present']}/${s['total']})',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          if (records.isEmpty)
            const Padding(padding: EdgeInsets.all(24), child: Center(child: Text('No attendance records yet.')))
          else
            ...records.map((r) => ListTile(
                  title: Text('${r['date']}'.split('T').first),
                  trailing: Chip(label: Text('${r['status']}')),
                )),
        ],
      ),
    );
  }
}

class FeesTab extends StatefulWidget {
  const FeesTab({super.key});
  @override
  State<FeesTab> createState() => _FeesTabState();
}

class _FeesTabState extends State<FeesTab> {
  List<dynamic> _fees = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final f = await ApiService.instance.get('/fees/me') as List;
      setState(() => _fees = f);
    } catch (e) {
      setState(() => _error = e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));
    if (_fees.isEmpty) {
      return const Center(child: Text('No fee invoices in database.'));
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        itemCount: _fees.length,
        itemBuilder: (_, i) {
          final f = _fees[i] as Map<String, dynamic>;
          return ListTile(
            title: Text(f['title'] ?? ''),
            subtitle: Text('Due: ${f['dueDate']}'),
            trailing: Text('₹${f['amount']}'),
          );
        },
      ),
    );
  }
}

class BusTab extends StatefulWidget {
  const BusTab({super.key});
  @override
  State<BusTab> createState() => _BusTabState();
}

class _BusTabState extends State<BusTab> {
  Map<String, dynamic>? _loc;
  String? _error;
  String? _busNumber;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final user = await ApiService.instance.savedUser;
    final bus = user?['student']?['busNumber'] as String?;
    if (bus == null || bus.isEmpty) {
      setState(() => _error = 'No bus assigned to your profile in the database.');
      return;
    }
    setState(() => _busNumber = bus);
    _track(bus);
  }

  Future<void> _track([String? bus]) async {
    final bn = bus ?? _busNumber;
    if (bn == null) return;
    setState(() { _error = null; _loc = null; });
    try {
      final loc = await ApiService.instance.get('/transport/location?busNumber=$bn');
      setState(() => _loc = loc as Map<String, dynamic>);
    } catch (e) {
      setState(() => _error = e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null && _loc == null) {
      return Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(_error!, textAlign: TextAlign.center)));
    }
    if (_loc == null) {
      return const Center(child: CircularProgressIndicator());
    }
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Bus ${_loc!['busNumber']}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          Text('Route: ${_loc!['routeName']}'),
          Text('Lat ${_loc!['latitude']}, Lng ${_loc!['longitude']}'),
          Text('Speed: ${_loc!['speed']} km/h'),
          const SizedBox(height: 16),
          FilledButton(onPressed: () => _track(), child: const Text('Refresh')),
        ],
      ),
    );
  }
}
