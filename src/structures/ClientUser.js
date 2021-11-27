const User = require('./User')
const { StickerBuilder } = require("instagram-private-api/dist/sticker-builder/sticker-builder")

/**
 * Represents the logged in client's Instagram user.
 * @extends {User}
 */
class ClientUser extends User {
    /**
     * @param {Client} client The instantiating client
     * @param {object} data The data for the client user.
     */
    constructor (client, data) {
        super(client, data)
        this._patch(data)
    }

    _patch (data) {
        super._patch(data)
        /**
         * @type {boolean}
         * Whether the user has enabled contact synchronization
         */
        this.allowContactsSync = data.allowContactsSync
        /**
         * @type {string}
         * The phone number of the user
         */
        this.phoneNumber = data.phoneNumber
    }

    get follow () { return undefined }
    get unfollow () { return undefined }
    get block () { return undefined }
    get unblock () { return undefined }
    get approveFollow () { return undefined }
    get denyFollow () { return undefined }
    get removeFollower () { return undefined }
    get send () { return undefined }

    /**
     * Change the bot's biography
     * @param {string} content The new biography
     * @returns {Promise<string>} The new biography
     */
    async setBiography ({ content }) {
        this.biography = content
        await this.client.ig.account.setBiography(content)
        return this.biography
    }

    async postPhotoInStory ({ buffer, media }) {
        const sticker = new StickerBuilder()
            .add(StickerBuilder.attachmentFromMedia((media).center()))
            .build()
    
        const story = await this.client.ig.publish.story({
            file: buffer,
            stickerConfig: sticker
        })
    
        return story
    }
    
    async postStory ({ buffer }) {
        const story = await this.client.ig.publish.story({
            file: buffer
        })
    
        return story
    }
    
    async postPhoto ({ buffer, caption, location, usertags }) {
        const media = await this.client.ig.publish.photo({
            file: buffer,
            caption: caption ?? "",
            location: location ?? undefined,
            usertags: usertags ?? undefined
        })
    
        return media
    }
    
    async findLocation ({ lat, lng, query }) {
        const locations = await this.client.ig.search.location(lat, lng, query ?? "")
        return locations
    }
    
    async tagUser (users) {
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
    

    toJSON () {
        return {
            ...super.toJSON(),
            ...{
                allowContactsSync: this.allowContactsSync,
                phoneNumber: this.phoneNumber
            }
        }
    }
}

module.exports = ClientUser
