import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'services/api_service.dart';
import 'screens/login_screen.dart';
import 'screens/learn_screen.dart';
import 'screens/schedule_screen.dart';
import 'screens/more_screen.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiService.instance.loadToken();
  runApp(const StudentApp());
}

class StudentApp extends StatelessWidget {
  const StudentApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(title: 'SchoolX Student', theme: AppTheme.light(), home: const RootScreen());
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
    _check();
  }

  Future<void> _check() async {
    final user = await ApiService.instance.savedUser;
    if (mounted) setState(() => _user = user);
  }

  @override
  Widget build(BuildContext context) {
    if (_user == null) {
      return LoginScreen(onSuccess: _check);
    }

    final titles = ['Home', 'Learn', 'Schedule', 'More'];
    final bodies = [
      HomeScreen(user: _user!, onNavigate: (t) => setState(() => _tab = t)),
      const LearnScreen(),
      const ScheduleScreen(),
      DefaultTabController(
        length: 3,
        child: Column(
          children: [
            const TabBar(tabs: [Tab(text: 'Attendance'), Tab(text: 'Fees'), Tab(text: 'Bus')]),
            Expanded(
              child: TabBarView(children: [AttendanceTab(), FeesTab(), BusTab()]),
            ),
          ],
        ),
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: Text('SchoolX · ${titles[_tab]}')),
      body: bodies[_tab],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.menu_book), label: 'Learn'),
          NavigationDestination(icon: Icon(Icons.calendar_today), label: 'Schedule'),
          NavigationDestination(icon: Icon(Icons.more_horiz), label: 'More'),
        ],
      ),
    );
  }
}
