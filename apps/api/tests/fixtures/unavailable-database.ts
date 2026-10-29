import dns from "node:dns";
import { syncBuiltinESMExports } from "node:module";

// Only socket-failure test children load this native-Node DNS fixture.
// Delegate overload/callback handling to the actual resolver; change only DNS.
const lookup = dns.lookup;
dns.lookup = ((hostname, ...args) =>
  Reflect.apply(lookup, dns, [
    hostname === "postgres_test" ? "127.0.0.1" : hostname,
    ...args,
  ]) as ReturnType<typeof dns.lookup>) as typeof dns.lookup;
syncBuiltinESMExports();
