import User from "./models/user.model.js"

export const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('user connected', socket.id)

        socket.on('identity', async ({ userId }) => {
            try {
                const user = await User.findByIdAndUpdate(userId, { socketId: socket.id, isOnline: true }, { new: true })
                console.log('user identity', user)
            } catch (error) {
                console.log(error)
            }
        })

        socket.on('disconnect', async () => {
            try {
                const user = await User.findOneAndUpdate({ socketId: socket.id }, { socketId: null, isOnline: false })
                console.log('user disconnected', user)
            } catch (error) {
                console.log(error)
            }
        })
    })
}