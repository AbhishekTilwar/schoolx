import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'services/api_service.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/content_screen.dart';
import 'screens/attendance_screen.dart';
import 'screens/bus_screen.dart';
import 'screens/chat_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiService.instance.loadToken();
  runApp(const TeacherApp());
}

class TeacherApp extends StatelessWidget {
  const TeacherApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SchoolX Teacher',
      theme: AppTheme.light(),
      home: const RootScreen(),
    );
  }
}

class RootScreen extends StatefulWidget {
  const RootScreen({super.key});

  @override
  State<RootScreen> createState() => _RootScreenState();
}

class _RootScreenState extends State<RootScreen> {
  Map<String, dynamic>? _user;
  int _tab = 0;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final user = await ApiService.instance.savedUser;
    setState(() => _user = user);
  }

  @override
  Widget build(BuildContext context) {
    if (_user == null) {
      return LoginScreen(onSuccess: () async {
        final user = await ApiService.instance.savedUser;
        setState(() => _user = user);
      });
    }

    final titles = ['Home', 'Content', 'Attendance', 'Bus', 'Chat'];
    final bodies = [
      HomeScreen(user: _user!, onNavigate: (t) => setState(() => _tab = t)),
      const ContentScreen(),
      const AttendanceScreen(),
      const BusScreen(),
      const ChatScreen(),
    ];

    return Scaffold(
      appBar: AppBar(title: Text('SchoolX · ${titles[_tab]}')),
      body: bodies[_tab],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.article), label: 'Content'),
          NavigationDestination(icon: Icon(Icons.fact_check), label: 'Attendance'),
          NavigationDestination(icon: Icon(Icons.directions_bus), label: 'Bus'),
          NavigationDestination(icon: Icon(Icons.chat), label: 'Chat'),
        ],
      ),
    );
  }
}
