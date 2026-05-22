import 'package:flutter_test/flutter_test.dart';
import 'package:app_teacher/main.dart';

void main() {
  testWidgets('App loads', (WidgetTester tester) async {
    await tester.pumpWidget(const TeacherApp());
    expect(find.text('SchoolX Teacher'), findsOneWidget);
  });
}
