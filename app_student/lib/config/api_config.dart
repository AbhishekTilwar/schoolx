import 'dart:io';

String get apiBaseUrl {
  if (Platform.isAndroid) return 'http://10.0.2.2:3000/api/v1';
  return 'http://127.0.0.1:3000/api/v1';
}
