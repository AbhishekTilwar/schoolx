import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  List<dynamic> _threads = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final threads = await ApiService.instance.get('/chat/threads') as List;
    setState(() => _threads = threads);
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: _threads.length,
      itemBuilder: (_, i) {
        final t = _threads[i] as Map<String, dynamic>;
        return ListTile(
          title: Text(t['title'] ?? 'Chat'),
          subtitle: Text(t['lastMessage']?['body'] ?? 'No messages'),
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => ChatThreadScreen(threadId: t['id'], title: t['title'])),
          ),
        );
      },
    );
  }
}

class ChatThreadScreen extends StatefulWidget {
  final String threadId;
  final String title;
  const ChatThreadScreen({super.key, required this.threadId, required this.title});

  @override
  State<ChatThreadScreen> createState() => _ChatThreadScreenState();
}

class _ChatThreadScreenState extends State<ChatThreadScreen> {
  List<dynamic> _messages = [];
  final _input = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final msgs = await ApiService.instance.get('/chat/threads/${widget.threadId}/messages') as List;
    setState(() => _messages = msgs);
  }

  Future<void> _send() async {
    if (_input.text.trim().isEmpty) return;
    await ApiService.instance.post('/chat/threads/${widget.threadId}/messages', {'body': _input.text.trim()});
    _input.clear();
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title ?? 'Chat')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: _messages.length,
              itemBuilder: (_, i) {
                final m = _messages[i] as Map<String, dynamic>;
                return Align(
                  alignment: Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(m['authorName'] ?? '', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                        Text(m['body'] ?? ''),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                Expanded(child: TextField(controller: _input, decoration: const InputDecoration(hintText: 'Message'))),
                IconButton(onPressed: _send, icon: const Icon(Icons.send)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
