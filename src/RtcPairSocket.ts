import { EventEmitter } from 'ee-typed';
import Peer, { DataConnection } from 'peerjs';

type Events = {
  open(): void;
  close(): void;
  message(data: Uint8Array): void;
  error(err: Error): void;
};

export default class RtcPairSocket extends EventEmitter<Events> {
  private conn?: DataConnection;

  constructor(
    private pairingCode: string,
    private party: 'alice' | 'bob',
  ) {
    super();
    this.connect().catch((err) => this.emit('error', ensureError(err)));
  }

  private async connect() {
    const peer = new Peer(`rtc-pair-socket-${this.pairingCode}-${this.party}`);

    await new Promise((resolve, reject) => {
      peer.on('open', resolve);
      peer.on('error', reject);
    });

    let conn: DataConnection;

    if (this.party === 'alice') {
      const connPromise = new Promise<DataConnection>(
        resolve => peer.on('connection', resolve),
      );

      const notifyConn = peer.connect(`emp-wasm-${this.pairingCode}-bob`);
      notifyConn.on('open', () => notifyConn.close());

      conn = await connPromise;
    } else {
      conn = peer.connect(`emp-wasm-${this.pairingCode}-alice`);

      await new Promise<void>((resolve, reject) => {
        conn.on('open', resolve);
        conn.on('error', reject);

        peer.on('connection', (notifyConn) => {
          notifyConn.close();
          conn.close();

          conn = peer.connect(`emp-wasm-${this.pairingCode}-alice`);
          conn.on('open', resolve);
          conn.on('error', reject);
        });
      });
    }

    this.conn = conn;

    conn.on('data', (data) => {
      let buf: Uint8Array;

      if (data instanceof ArrayBuffer) {
        buf = new Uint8Array(data);
      } else if (data instanceof Uint8Array) {
        buf = data;
      } else {
        this.emit('error', new Error('Received unrecognized data type'));
        return;
      }

      this.emit('message', buf);
    });

    conn.on('error', (err) => {
      this.emit('error', err);
    });

    conn.on('close', () => {
      this.close();
    });
  }

  send(data: Uint8Array) {
    if (!this.conn) {
      throw new Error('Connection not established');
    }

    this.conn.send(data);
  }

  close() {
    if (this.conn) {
      this.conn.close();
      this.conn = undefined;
      this.emit('close');
    }
  }
}

function ensureError(err: any): Error {
  return err instanceof Error ? err : new Error(JSON.stringify(err));
}
