import 'dart:io';

/// API base URL — adjust per platform if needed.
/// Android emulator: http://10.0.2.2:3000
/// iOS simulator / macOS: http://127.0.0.1:3000
String get apiBaseUrl {
  if (Platform.isAndroid) return 'http://10.0.2.2:3000/api/v1';
  return 'http://127.0.0.1:3000/api/v1';
}

String get wsBaseUrl {
  if (Platform.isAndroid) return 'ws://10.0.2.2:3000';
  return 'ws://127.0.0.1:3000';
}
