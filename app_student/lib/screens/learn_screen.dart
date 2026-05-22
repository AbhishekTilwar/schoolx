import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../widgets/content_card.dart';
import 'content_detail_screen.dart';

class LearnScreen extends StatefulWidget {
  const LearnScreen({super.key});

  @override
  State<LearnScreen> createState() => _LearnScreenState();
}

class _LearnScreenState extends State<LearnScreen> {
  List<dynamic> _items = [];
  String _filter = '';

  Future<void> _load() async {
    final q = _filter.isEmpty ? '' : '?tags=$_filter';
    final res = await ApiService.instance.get('/content$q');
    setState(() => _items = res['data'] as List? ?? []);
  }

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            children: ['', 'HOMEWORK', 'NOTICE', 'ANNOUNCEMENT', 'UNIT_TEST'].map((f) {
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: Text(f.isEmpty ? 'All' : f),
                  selected: _filter == f,
                  onSelected: (_) {
                    setState(() => _filter = f);
                    _load();
                  },
                ),
              );
            }).toList(),
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: _load,
            child: _items.isEmpty
                ? const Center(child: Text('No content published yet.'))
                : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _items.length,
              itemBuilder: (_, i) {
                final item = _items[i] as Map<String, dynamic>;
                return ContentCard(
                  item: item,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => ContentDetailScreen(contentId: item['id'])),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}

