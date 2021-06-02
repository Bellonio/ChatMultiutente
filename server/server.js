const net = require("net")
const Utenti = require("./Utenti")
const Protocollo = require("./Protocollo")


var protocollo = new Protocollo()
var utenti = new Utenti(protocollo)

console.log("Server in esecuzione")

net.createServer((socket) => {
    if (utenti.trovaUtenteDaIP(socket.remoteAddress) == null) {
        //non l'ha trovato, quindi è una nuova connessione
        utenti.registraUtente(socket.remoteAddress, socket)
    }

    socket.on("data", (msg) => {
        let utente = utenti.trovaUtenteDaIP(socket.remoteAddress)
            
        let messaggio = msg.toString()

		/*Se si usa il client telnet. OCCHIO PERÒ CHE MANCANO I CONTROLLI 
			(visto che sull'app ci sono già non vado a rifarli)
			//(telnet alla fine del msg mette un "\n")
		if(messaggio.includes("\n")){
				//rimuovo il "\n" finale
			messaggio = msg.toString().slice(0, msg.toString().length - 2)
		}*/

        //controllo che sia connesso, sennò devo dirgli che non può più mandare msg
        if (utente.isAway() == false) {

            //controlla che non abbia dato un invio per sbaglio (msg vuoto)
            if (messaggio.length > 0) {
                if (utente.getUtenteConfigurato() == false) {
                    //si deve ancora configurare l'utente
                    if (messaggio.includes("#config#")) {
                        let successo = utenti.configUtente(messaggio, utente)
                        if (successo) {
                            //controlla se ha finito la configurazione
                            let finitoConfig = protocollo.controllaConfigurazione(utente, socket)
                        }
                    }//else dall'app non può andare alla chat se non ha configurato tutto quindi non devo stampargli nulla
                } else {
                    //AL MOMENTO NON RIMUOVE DALLA LISTA DEGLI UTENTI CONNESSI QUESTO UTENTE XKE
                    // CI STAREBBE FARE UN'ALTRA VOCE CONFIG CON TIPO UNA PASSW CHE CHIDE QUANDO
                    // (da disconnesso) TENTI DI INVIARE UN MESSAGGIO.

                    utente.faiPartireCountdown(utenti.getUtenti())

                    //controlla se vuole inviare un msg privato o meno
                    if (messaggio.includes("#private#")) {
                        let dest = messaggio.slice(messaggio.lastIndexOf("#") + 1, messaggio.indexOf(":"))
                        let msg = messaggio.slice(messaggio.indexOf(":") + 1)

                        //cerca il destinatario
                        let utenteDest = utenti.trovaUtenteDaNickname(dest)
                        if (utenteDest != null) {
                            if (utenteDest.isAway() == false) {
                                utenteDest.getSocket().write("\t(Private)-" + utente.getNickname() + ": " + msg + "\n")
                            } else {
                                socket.write("IL DESTINATARIO SI È DISCONNESSO\n")
                            }
                        } else {
                            socket.write("DESTINATARIO INESISTENTE\n")
                        }
                    } else {
                        //scrive il msg a tutti gli altri
                        try{
		                    utenti.getUtenti().forEach(altroUtente => {
		                        //Non lo rimando allo stesso utente che l'ha inviato.; Non lo mando ad un
		                        // utente che è si è scollegato; Non lo mando a chi non ha ancora
		                        // terminato la configurazione
		                        if (altroUtente.getNickname() != utente.getNickname() &&
		                            altroUtente.isAway() == false && altroUtente.getUtenteConfigurato()) {

									altroUtente.getSocket().write(utente.getNickname() + ": " + messaggio + "\n")
		                        }
		                    })
                        }catch(err){
							//l'utente ha chiuso il client. Non so ancora come terminare
							// la connessione quando chiude il client
						}
                    }
                }
            }
        } else {
            if (utente.getDisconnessoPerSempre() == false) {
                if (messaggio == "S" || messaggio == "N") {
                    utente.setVuoiRiconn(messaggio)
                    if (messaggio == "S") {
                        socket.write("\tInserisci la passw...\n")
                    } else {
                        utente.setDisconnessoPerSempre(true)
                    }
                } else {
                    //se non ha scritto S o N controlla "cosa sta facendo", se getVuoiRiconn è = "S"
                    // allora ha inserito la passw, altrimenti non ha capito che deve scriver "S" o "N"
                    if (utente.getVuoiRiconn() == "S") {
                        //controllo la passw
                        utente.provaARiconn(messaggio, utenti.getUtenti())
                    } else {
                        socket.write("Devi inserire S o N per riconneterti o disconnetterti per sempre !\n")
                    }
                }
            } else {
                //sta provando a scrivere ma ormai non può più riconnetersi
                socket.write("CHIUDI IL CLIENT, TI SEI DISCONNESSO ORMAI !!!\n")

                //N.B. non so come fare per rimuovere l'utente dalla lista... facendo così (grazie ai vari flag)
                // non ci sono problemi, ma se lo rimuovessi dalla lista appena scrive qualocosa (riga 13)
                // non lo riconoscerebbe e lo aggiungerebbe alla lista.
            }
        }
    })
}).listen(3000, "192.168.1.103")
