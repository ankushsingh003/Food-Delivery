import mongoose from 'mongoose';
const schema = new mongoose.Schema({ name: String, socketId: String });
const Model = mongoose.model('TestModel', schema);
const m = new Model({ name: 'testing', socketId: 'abc' });
console.log(m.populated('someField')); // just to check something
