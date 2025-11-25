/** L5-6: Virtual Exhibition - Multi-user 3D space */
class VirtualExhibition {
  constructor() { console.log('Virtual Exhibition initialized'); }
  createRoom(name) { return { roomId: 'room-' + Date.now() }; }
  joinRoom(roomId) { return true; }
}
window.virtualExhibition = new VirtualExhibition();
