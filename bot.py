from telegram import Update
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext

# Remplacez par votre token (récupéré via BotFather)
TOKEN = "VOTRE_TOKEN_ICI"

# Fonction pour gérer la commande /start
def start(update: Update, context: CallbackContext):
    update.message.reply_text("👋 Salut ! Je suis ton premier bot Telegram. Tape /help pour voir les commandes.")

# Fonction pour gérer la commande /help
def help(update: Update, context: CallbackContext):
    update.message.reply_text("ℹ️ Commandes disponibles :\n/start - Démarrer le bot\n/help - Afficher l'aide")

# Fonction pour répondre aux messages
def echo(update: Update, context: CallbackContext):
    update.message.reply_text(f"🔁 Vous avez dit : {update.message.text}")

def main():
    # Initialisation du bot
    updater = Updater(TOKEN, use_context=True)
    dispatcher = updater.dispatcher

    # Ajout des gestionnaires de commandes
    dispatcher.add_handler(CommandHandler("start", start))
    dispatcher.add_handler(CommandHandler("help", help))
    
    # Réponse aux messages texte
    dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, echo))

    # Lancement du bot
    updater.start_polling()
    print("🤖 Le bot est en ligne !")
    updater.idle()  # Garde le bot actif

if __name__ == "__main__":
    main()