import test from "node:test";
import assert from "node:assert/strict";
import { validateRoomAction } from "../src/room/validate-action.js";

const room = { id: "r", state: "playing", hostId: "p1", maxPlayers: 4, players: [{id:"p1"},{id:"p2"}], currentRound: {status:"active", answers:[], deadlineAt:1000} };
const base = { actionId:"a1", expectedRevision:5, type:"answer.submit", payload:{text:"x"} };

test("valid member answer passes before server deadline",()=>{
 assert.deepEqual(validateRoomAction(room,base,"p2",999),{valid:true,errors:[]});
});
test("rejects outsider, empty answer, and late answer",()=>{
 assert.ok(validateRoomAction(room,base,"outsider",999).errors.includes("Only members can answer"));
 assert.ok(validateRoomAction(room,{...base,payload:{text:" "}},"p2",999).errors.includes("Answer text required"));
 assert.ok(validateRoomAction(room,base,"p2",1000).errors.includes("Answer deadline passed"));
});
test("host-only actions enforce permissions and lifecycle",()=>{
 assert.deepEqual(validateRoomAction(room,{...base,type:"round.reveal"},"p1",500),{valid:true,errors:[]});
 assert.ok(validateRoomAction(room,{...base,type:"round.reveal"},"p2",500).errors.includes("Only host can reveal"));
 assert.ok(validateRoomAction({...room,state:"lobby"},{...base,type:"room.start"},"p1",500).errors.includes("At least two members required")===false);
});
test("rejects malformed envelopes and unknown actions",()=>{
 assert.ok(validateRoomAction(room,{...base,actionId:" "},"p1",10).errors.includes("actionId required"));
 assert.ok(validateRoomAction(room,{...base,type:"alien.action"},"p1",10).errors.includes("Unknown action type"));
});
