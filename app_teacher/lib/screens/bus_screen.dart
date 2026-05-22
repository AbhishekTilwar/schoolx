import 'package:flutter/material.dart';
import '../services/api_service.dart';

class BusScreen extends StatefulWidget {
  const BusScreen({super.key});

  @override
  State<BusScreen> createState() => _BusScreenState();
}

class _BusScreenState extends State<BusScreen> {
  final _bus = TextEditingController();
  List<dynamic> _buses = [];
  Map<String, dynamic>? _location;
  String? _error;
  bool _loadingBuses = true;

  @override
  void initState() {
    super.initState();
    _loadBuses();
  }

  @override
  void dispose() {
    _bus.dispose();
    super.dispose();
  }

  Future<void> _loadBuses() async {
    setState(() { _loadingBuses = true; _error = null; });
    try {
      final buses = await ApiService.instance.get('/transport/buses') as List;
      setState(() {
        _buses = buses;
        if (buses.isNotEmpty && _bus.text.isEmpty) {
          _bus.text = buses[0]['busNumber'] as String;
        }
      });
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loadingBuses = false);
    }
  }

  Future<void> _track() async {
    if (_bus.text.trim().isEmpty) {
      setState(() => _error = 'Select or enter a bus number');
      return;
    }
    setState(() { _error = null; _location = null; });
    try {
      final loc = await ApiService.instance.get('/transport/location?busNumber=${_bus.text.trim()}');
      setState(() => _location = loc as Map<String, dynamic>);
    } catch (e) {
      setState(() => _error = e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loadingBuses) {
      return const Center(child: CircularProgressIndicator());
    }

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (_buses.isNotEmpty)
            DropdownButtonFormField<String>(
              value: _buses.any((b) => b['busNumber'] == _bus.text) ? _bus.text : null,
              decoration: const InputDecoration(labelText: 'Bus from database'),
              items: _buses
                  .map((b) => DropdownMenuItem(
                        value: b['busNumber'] as String,
                        child: Text('${b['busNumber']} — ${b['routeName']}'),
                      ))
                  .toList(),
              onChanged: (v) {
                if (v != null) setState(() => _bus.text = v);
              },
            )
          else
            const Text('No buses in database. Add rows to bus_routes table.'),
          const SizedBox(height: 8),
          TextField(
            controller: _bus,
            decoration: const InputDecoration(labelText: 'Bus number'),
          ),
          const SizedBox(height: 12),
          FilledButton(onPressed: _track, child: const Text('Track bus')),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: Colors.red)),
          ],
          if (_location != null) ...[
            const SizedBox(height: 24),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Bus ${_location!['busNumber']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text('Route: ${_location!['routeName']}'),
                    Text('Lat: ${_location!['latitude']}'),
                    Text('Lng: ${_location!['longitude']}'),
                    Text('Speed: ${_location!['speed']} km/h'),
                    Text('Updated: ${_location!['recordedAt']}'),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
