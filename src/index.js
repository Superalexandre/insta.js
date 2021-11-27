'use strict'
const Client = require('./structures/Client')
const ClientUser = require('./structures/ClientUser')
const { StickerBuilder } = require("instagram-private-api/dist/sticker-builder/sticker-builder")

Client.prototype.postPhotoInStory = async function(buffer, media) {
    const sticker = new StickerBuilder()
        .add(StickerBuilder.attachmentFromMedia((media).center()))
        .build()

    const story = await this.client.ig.publish.story({
        file: buffer,
        stickerConfig: sticker
    })

    return story
}

Client.prototype.postStory = async function(buffer) {
    const story = await this.client.ig.publish.story({
        file: buffer
    })

    return story
}

Client.prototype.postPhoto = async function(buffer, caption, location, usertags) {
    const media = await this.client.ig.publish.photo({
        file: buffer,
        caption: caption ?? "",
        location: location ?? undefined,
        usertags: usertags ?? undefined
    })

    return media
}

Client.prototype.findLocation = async function(lat, lng, query) {
    const locations = await this.client.ig.search.location(lat, lng, query ?? "")
    return locations
}

Client.prototype.tagUser = async function(users) {
    async function generateUsertagFromName(ig, name, x, y) {
        const clamp = (value, min, max) => Math.max(Math.min(value, max), min)

        x = clamp(x, 0.0001, 0.9999)
        y = clamp(y, 0.0001, 0.9999)
        const { pk } = await ig.user.searchExact(name)
        return {
            user_id: pk,
            position: [x, y]
        }
    }

    if (!Array.isArray(users)) return []

    const usertags = []

    for (let i = 0; i < users.length; i++) {
        const user = users[i]

        if (!user.username || !user.posX || !user.posY) continue

        const generatedUserTag = await generateUsertagFromName(this.client.ig, user.username, user.posX, user.posY)
        usertags.push(generatedUserTag)
    }

    return usertags
}

module.exports = {
    // Client
    Client,
    ClientUser,

    // Structures
    Attachment: require('./structures/Attachment'),
    Chat: require('./structures/Chat'),
    Message: require('./structures/Message'),
    MessageCollector: require('./structures/MessageCollector'),
    User: require('./structures/User'),

    // Util
    Util: require('./utils/Util')
}
