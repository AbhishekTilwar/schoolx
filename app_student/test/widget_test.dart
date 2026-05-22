import 'package:flutter_test/flutter_test.dart';
import 'package:app_student/main.dart';

void main() {
  testWidgets('App loads', (WidgetTester tester) async {
    await tester.pumpWidget(const StudentApp());
    expect(find.text('SchoolX Student'), findsOneWidget);
  });
}
