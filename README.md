# CHAT FRA CLIENT (con Socket TCP)
***
_Ho riscontrato un problema:_
se nell'activity principale creo il socket e mi funziona tutto, MA quando passo alla seconda 
activity in cui creo di nuovo il socket NON RICEVE PIÙ I MSG DAL SERVER.

_Come ho tentato di risolvere:_
nell'activity principale non creo il socket ma passo i dati alla seconda activity.
MA ho un altro problema: se i dati che ho passato provocano un errore (l'username è già in uso oppure 
contiene spazi), correttamente vengo rimandato alla activity principale con cui mando il nuovo username alla 
seconda activity MA questa NON 
RICEVE PIÙ I MSG DAL SERVER

_CONCLUSIONE:_
SE SI INSERISCE UN USERNAME VALIDO (cioè non si provocano errori) FUNZIONA TUTTO CORRETTAMENTE.
					
_Future implementazioni:_
- ListView per i msg (con layout dei msg tipo come su WhatsApp)
- Interfaccia/Activity apposta per inviare un msg privato (ora usi "#private#NicknameDestinatario:ciao")

