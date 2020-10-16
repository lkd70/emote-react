const { Plugin } = require("powercord/entities");
const { getModule } = require("powercord/webpack");
const { getMessage, getMessages } = getModule(["getMessages"], false);
const { getChannel } = getModule(["getChannel"], false);
const { getChannelId } = getModule(["getLastSelectedChannelId"], false);
const DiscordPermissions = getModule(["Permissions"], false).Permissions;
const Permissions = getModule(["getHighestRole"], false);
const { addReaction } = getModule(["addReaction"], false);

module.exports = class EmoteReact extends Plugin {
	async startPlugin() { 
		powercord.api.commands.registerCommand({
			command: "ereact",
			aliases: [],
			description: "Reacts to a message with given emotes",
			usage: "{c} {emotes} [message id] [channel id]",
			executor: async (args) => {
                let emotes = args[0],
                    messageid = args[1],
					channelid = args[2] || getChannelId();
				if (!messageid) {
					const messages = getMessages(channelid)._array;
					if (messages.length == 0) {
						return {
							send: false,
							result:
								"Could not get last message ID, please enter message ID manually.",
						};
					}
					messageid = messages[messages.length - 1].id;
				}
				if (!getMessage(channelid, messageid)) {
					return {
						send: false,
						result: `Could not find a message with the ID \`${messageid}\`.`,
					};
				}

				const channel = getChannel(channelid);

				if (!this._canReact(channel)) return {
					result: `You don't have permissions to react in <#${channelid}> channel`
                };

				const emoteArray = emotes.split('>').map(e => this._getEmoteParts(e)).filter(e => e !== null)

				for (let e = 0; e < emoteArray.length; e++) {
					const emote = emoteArray[e];
					addReaction(channelid, messageid, emote);
					await new Promise((r) => setTimeout(r, 350)); // avoid ratelimit
				}
				

			},
		});
	}
	
	_getEmoteParts = msg => {
        const parts = msg.split(':');
        if (parts.length !== 3) return null;
        return { name: parts[1], id: parts[2] };
	};

	_canReact(channel) {
		return Permissions.can(
			DiscordPermissions.ADD_REACTIONS,
			channel
		) ||
		channel.type == 1 || // DM
		channel.type == 3 // Group DM
	}
};
