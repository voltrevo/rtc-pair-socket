# RTC Pair Socket

`RtcPairSocket` is a lightweight TypeScript class for establishing encrypted peer-to-peer communication between two parties (Alice and Bob) using [PeerJS](https://peerjs.com/) and an encryption layer. This library facilitates encrypted message exchange over WebRTC, with events to handle connection, data, and errors.

## Features

- Secure peer-to-peer communication using WebRTC and PeerJS.
- Symmetric encryption using a pairing code.
- Event-based architecture for handling connection, messages, and errors.
- Minimal dependencies.

## Installation

To install the dependencies, run:

```bash
npm install
```

## Usage

```ts
import RtcPairSocket from './RtcPairSocket';

const pairingCode = 'your-secret-code';
const party = 'alice'; // or 'bob'

const socket = new RtcPairSocket(pairingCode, party);

socket.on('open', () => {
  console.log('Connection opened!');
});

socket.on('message', (data) => {
  console.log('Received message:', data);
});

socket.on('error', (err) => {
  console.error('Error:', err);
});

socket.on('close', () => {
  console.log('Connection closed.');
});

// To send a message
socket.send('Hello, Bob!');

// You can also send structures and they'll be reconstructed on the other side
// (not classes though, basically json plus undefined and Uint8Array)
socket.send([1, 2, 'three']);
```

## Events

- `open`: Emitted when the connection is successfully established.
- `message`: Emitted when an encrypted message is received.
- `error`: Emitted when an error occurs.
- `close`: Emitted when the connection is closed.

## Methods

- `send(data: unknown)`: Sends encrypted data to the connected peer.
- `close()`: Closes the connection.
- `isClosed()`: Returns true if the connection is closed.

## How it Works

- **Pairing Code**: A shared secret is used as the seed for generating a symmetric encryption key. This ensures that only Alice and Bob can decrypt each other's messages.
- **Peer Connection**: Depending on the party (alice or bob), the socket establishes a WebRTC connection to the other party.
- **Encryption**: All messages sent over the connection are encrypted using the Cipher class, which encrypts and decrypts data using the shared key.

## License

This project is licensed under the MIT License.
