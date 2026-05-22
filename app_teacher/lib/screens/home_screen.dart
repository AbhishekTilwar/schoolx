import 'package:flutter/material.dart';
class HomeScreen extends StatelessWidget {
  final Map<String, dynamic> user;
  final void Function(int tab) onNavigate;

  const HomeScreen({super.key, required this.user, required this.onNavigate});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Hello, ${user['fullName'] ?? 'Teacher'}', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        Text(user['organization']?['name'] ?? '', style: const TextStyle(color: Colors.grey)),
        const SizedBox(height: 24),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.4,
          children: [
            _action(context, Icons.fact_check, 'Attendance', () => onNavigate(2)),
            _action(context, Icons.assignment, 'Post content', () => onNavigate(1)),
            _action(context, Icons.directions_bus, 'Track bus', () => onNavigate(3)),
            _action(context, Icons.chat, 'Class chat', () => onNavigate(4)),
          ],
        ),
      ],
    );
  }

  Widget _action(BuildContext context, IconData icon, String label, VoidCallback onTap) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(icon, size: 32, color: Theme.of(context).colorScheme.primary),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
        ]),
      ),
    );
  }
}
