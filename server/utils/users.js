let users = [];

function userJoin(user, room, id) {
    const userr = {
        user: user,
        room: room,
        socketId: id
    }
    let idx = users.findIndex(us => us.socketId === id && us.room === room);
    if(idx === -1) {
        users.push(userr);
        // console.log(users);
        return userr;
    }
    return false
}

function getCurrentUser(use) {
    return users.find(user => user.user._id === use._id);
}

function userLeaves(user) {
    const index = users.findIndex(userr => userr.socketId === user);
    users = users.filter(us => {
        return us.socketId !== user;
    })
    // console.log(users);
}

function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeaves,
    getRoomUsers
}