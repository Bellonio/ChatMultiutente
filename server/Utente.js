/*Dati di configurazione di esempio (non per forza vanno mandati in ordine)
#config#nickname:Bellonio
#config#away_message:Adios
#config#timeout:25
#config#passw:1234
*/

class Utente {
    constructor(IP, socket) {
        this.IP = IP
        this.socket = socket
        this.nickname = null
        this.timeout = null
        this.away_msg = null
        this.passw = null

        //flag per sapere quando l'utente ha finito la configurazione
        this.utenteConfigurato = false
            //flag che passa a true quando passano i secondi, che ha specificato l'utente, dall'ultimo msg
        this.flagAway = false
        this.vuoiRiconn = null
        this.flagDisconnessoPerSempre = false

        //ID del timeout (il countdown)
        this.countdownMsg = null
    }

    getIP() { return this.IP }
    getSocket() { return this.socket }
    getNickname() { return this.nickname }
    setNickname(nick) {
        this.nickname = nick
    }

    getTimeout() { return this.timeout }
    setTimeout(time) {
        this.timeout = time
    }

    getAwayMsg() { return this.away_msg }
    setAwayMsg(away) {
        this.away_msg = away
    }

    getPassw() { return this.passw }
    setPassw(passw) {
        this.passw = passw
    }

    getVuoiRiconn() { return this.vuoiRiconn }
    setVuoiRiconn(yesNo) {
        this.vuoiRiconn = yesNo
    }

    getDisconnessoPerSempre() { return this.flagDisconnessoPerSempre }
    setDisconnessoPerSempre(disconn) {
        this.flagDisconnessoPerSempre = disconn
    }

    getUtenteConfigurato() { return this.utenteConfigurato }
    setUtenteConfigurato() {
        //non userò mai questo metodo per settarlo a false,
        // quindi non mi servono argomenti
        this.utenteConfigurato = true
    }

    //flag per sapere se è passato troppo tempo e si è disconnesso
    isAway() {
        return this.flagAway
    }


    faiPartireCountdown(altriUtenti) {
        //AL MOMENTO NON RIMUOVE DALLA LISTA DEGLI UTENTI CONNESSI QUESTO UTENTE XKE
        // CI STAREBBE FARE UN'ALTRA VOCE CONFIG CON TIPO UNA PASSW CHE CHIDE QUANDO
        // (da disconnesso) TENTI DI INVIARE UN MESSAGGIO.
        // Se metti la passw corretta allora ti riconnetti, altrimenti no...

        //altriUtenti = lista di Utente. Mi serve dopo per mandare il msg a
        // tutti che questo Utente si è disconesso


        //se non è null vuol dire che c'è un timeout da fermare
        if (this.countdownMsg != null) {
            clearTimeout(this.countdownMsg)
        }

        //setTimeout esegue la funzione passata/creata come primo parametro, dopo tot
        // MILLISECONDI, che gli passo come secondo parametro
        this.countdownMsg = setTimeout(() => {
            //è finito il countdown quindi lo "cancello" proprio
            clearTimeout(this.countdownMsg)
            this.countdownMsg = null
            this.flagAway = true
            this.informaAltri(altriUtenti)
        }, this.timeout * 1000)
    }


    informaAltri(altriUtenti, disconesso = true) {
        try{
		    altriUtenti.forEach((altroUtente) => {
		        //Invia il msg a tutti gli altri utenti (attivi, non ancora disconnessi)
		        if (altroUtente.getIP() != this.getIP() && altroUtente.isAway() == false) {
		            if (disconesso) {
		                altroUtente.socket.write("\t(Private)-" + this.getNickname() + ": " + this.away_msg + "\n")
		            } else {
		                altroUtente.socket.write("\t(Private)-" + this.getNickname() + " si è riconnesso\n")
		            }
		        } else if (altroUtente.getIP() == this.getIP()) {
		            //invio anche un msg a questo utente (come ultimo msg nella chat vedrà questo)
		            if (disconesso) {
		                this.socket.write("\t\t\t------ DISCONNESSO ------\n")
		                this.socket.write("\tHai impostato che dopo " + this.getTimeout() + "sec ti saresti scollegato...\nVuoi riconnetterti ? S/N\n")
		            } else {
		                this.socket.write("\t\t\t------ TI SEI RICONNESSO ------\n")
		            }
		        }
		    })
        }catch(err){
			//l'utente ha chiuso il client. Non so ancora come terminare
			// la connessione quando chiude il client
		}
    }


    provaARiconn(passwInserita, altriUtenti) {
        if (passwInserita != this.passw) {
            this.socket.write("\tEHI ! LA PASSWORD INSERITA È ERRATA !!! \tRiprova: \n")
        } else {
            this.flagAway = false
                //informa gli altri, sta volta li informa che si è riconnesso
            this.informaAltri(altriUtenti, false)
            this.vuoiRiconn = null
        }
    }
}

module.exports = Utente
