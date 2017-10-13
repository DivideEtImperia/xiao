const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const snekfetch = require('snekfetch');
const { shorten } = require('../../util/Util');

module.exports = class AnimeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'anime',
			aliases: ['my-anime-list-anime', 'mal-anime', 'kitsu-anime'],
			group: 'search',
			memberName: 'anime',
			description: 'Searches Kitsu.io for your query, getting anime results.',
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					key: 'query',
					prompt: 'What anime would you like to search for?',
					type: 'string'
				}
			]
		});
	}

	async run(msg, { query }) {
		try {
			const { text } = await snekfetch
				.get('https://kitsu.io/api/edge/anime')
				.query({ 'filter[text]': query });
			const body = JSON.parse(text);
			if (!body.data.length) return msg.say('Could not find any results.');
			const data = body.data[0].attributes;
			const embed = new MessageEmbed()
				.setColor(0xF75239)
				.setAuthor('Kitsu.io', 'https://i.imgur.com/y7nDpqR.png')
				.setURL(`https://kitsu.io/anime/${data.slug}`)
				.setThumbnail(data.posterImage ? data.posterImage.original : null)
				.setTitle(data.canonicalTitle)
				.setDescription(shorten(data.synopsis))
				.addField('❯ Type',
					`${data.showType} - ${data.status}`, true)
				.addField('❯ Episodes',
					data.episodeCount || 'N/A', true)
				.addField('❯ Start Date',
					data.startDate ? new Date(data.startDate).toDateString() : 'N/A', true)
				.addField('❯ End Date',
					data.endDate ? new Date(data.endDate).toDateString() : 'N/A', true);
			return msg.embed(embed);
		} catch (err) {
			return msg.say(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}
};
