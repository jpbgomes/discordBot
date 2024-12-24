require('dotenv').config();

const { Client, IntentsBitField, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessages,
  ],
});

const TARGET_GUILD_ID = '1296060935307268116';
const AUTHORIZED_USER_ID = '326836813215956994';

client.on('ready', (c) => {
  console.log(`✅ ${c.user.tag} is online.`);
});

const createVerifyEmbed = () => {
  try {
    return new EmbedBuilder()
      .setColor('#ff9500')
      .setTitle('👑 Vanguard RP')
      .setDescription('Por favor lê as <#1296065916529934367> do servidor e reage ao emoji :white_check_mark: para te verificares!')
      .setThumbnail('https://i.imgur.com/x7ORbOL.png')
      .setImage('https://i.imgur.com/x7ORbOL.png')
      .setTimestamp()
      .setFooter({ text: 'Verificação - Vanguard RP', iconURL: client.user.displayAvatarURL() });
  } catch (err) {
    console.error('Error creating the embed:', err);
    throw new Error('Embed creation failed.');
  }
};

const createAdEmbed = () => {
  try {
    const adEmbed = new EmbedBuilder()
      .setColor('#008cff')
      .setTitle('📢 Anúncio')
      .setThumbnail('https://i.imgur.com/x7ORbOL.png')
      .setDescription(
        'Este é um aviso importante e será **enviado apenas uma vez**. Não **contém links ou material malicioso**.\n\n' +
        'Estamos entusiasmados em anunciar a abertura oficial do **Vanguard RP**, um servidor de Roleplay com muitas opções de interação para os jogadores!'
      )
      .addFields(
        { name: '💼 Negócios e Carreiras', value: 'Cria o teu próprio negócio, gere uma empresa e aumenta o teu império. O que tu constróis, depende de ti. Faz parte de uma entidade governamental, e ajuda a cidade.' },
        { name: '💀 Armas e Organizações', value: 'Mergulha no mundo das organizações ilegais e cria a tua própria rede criminosa.\nPersonaliza o teu equipamento e cria as tuas próprias armas através do sistema de crafting.' },
      )
      .setTimestamp()
      .setFooter({ text: 'Vanguard RP', iconURL: client.user.displayAvatarURL() });

    const invite = new ButtonBuilder()
      .setLabel('Entrar no Discord')
      .setStyle(ButtonStyle.Link)
      .setURL('https://discord.gg/9qJRhbjFKk');

    const trailer = new ButtonBuilder()
      .setLabel('Ver Trailer')
      .setStyle(ButtonStyle.Link)
      .setURL('https://www.youtube.com/watch?v=Ge7cC8gBtE4&pp=ygUNZml2ZW0gdHJhb2xlcg%3D%3D');

      const row = new ActionRowBuilder().addComponents(invite, trailer);

      return { embeds: [adEmbed], components: [row] };
  } catch (err) {
    console.error('Erro ao criar o embed:', err);
    throw new Error('Falha na criação do embed.');
  }
};

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!sendembed') {
    const verifyChannel = client.channels.cache.get('1296524611298529300');

    if (verifyChannel) {
      try {
        await verifyChannel.send({ embeds: [createVerifyEmbed()] });
        const reply = await message.reply('Embed has been sent!');
        setTimeout(() => reply.delete(), 5000);
        message.delete();
      } catch (err) {
        console.error('Error sending the embed:', err);
        await message.reply('Failed to send the embed. Check bot permissions and try again.');
      }
    } else {
      await message.reply('Channel not found!');
    }
  }

  if (message.content === '!senddms') {
    try {
      if (message.guild?.id !== TARGET_GUILD_ID) {
        console.log(`Message ignored. Not from the target guild (${TARGET_GUILD_ID}).`);
        return;
      }
      if (message.author.id !== AUTHORIZED_USER_ID) {
        console.log(`Message ignored. Not from the authorized user (${AUTHORIZED_USER_ID}).`);
        return;
      }

      const guild = await client.guilds.fetch(TARGET_GUILD_ID);
      const members = await guild.members.fetch();

      members.forEach(async (member) => {
        if (!member.user.bot) {
          try {
            await member.send(createAdEmbed());
            console.log(`✅ DM sent to ${member.user.tag}`);
          } catch (err) {
            if (err.code === 50007) {
              console.error(`❌ Failed to send DM to ${member.user.tag}, DMs disabled or has blocked the bot`);
            } else {
              console.error(`❌ Failed to send DM to ${member.user.tag}`);
            }
          }
        }
      });

      await message.reply('DMs are being sent to all members.');
    } catch (err) {
      console.error('Error fetching members or sending DMs:', err);
      await message.reply('Failed to send DMs. Make sure the bot has the necessary permissions.');
    }
  }
});

client.login(process.env.TOKEN);
