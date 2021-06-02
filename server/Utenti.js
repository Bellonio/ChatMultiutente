const Utente = require("./Utente")

class Utenti {
    constructor(protocollo) {
        this.utenti = new Array()
        this.protocollo = protocollo
    }

    getUtenti() { return this.utenti }

    registraUtente(ip, socket) {
        this.utenti.push(new Utente(ip, socket))
    }

    configUtente(config, utente) {
        let okay = false

        //slice(indicePartenza, indiceFine)     !!! la partenza è inclusa; la fine è esclusa
        let val_config = config.slice(config.indexOf(":") + 1)
        config = config.slice(0, config.indexOf(":") + 1)

        switch (config) {
            case this.protocollo.getConfigNickname():
                if (val_config.includes(" ") || val_config.includes(":")) {
                    //anche il ":" non va bene xke lo suo come separatore
                    utente.getSocket().write("Error: USERNAME NON VALIDO !!!\n")
                } else {
                    //controlla che non esista ancora il nickname
                    if (this.trovaUtenteDaNickname(val_config) == null) {
                        //i controlli che sia stato inserito (lunghezza > 0)
                        // sono sull'app
                        utente.setNickname(val_config)
                        okay = true
                    } else {
                        utente.getSocket().write("Error-01: USERNAME GIÀ IN USO !!!\n")
                    }
                }
                break
            case this.protocollo.getConfigTimeout():
                let timeout = parseInt(val_config)
                //i controlli che sia stato inserito un numero
                // neanche mi servono perchè sull'app posso
                // inserire solo i numeri in quella EditText
                utente.setTimeout(timeout)
                okay = true
                break
            case this.protocollo.getConfigAway():
                utente.setAwayMsg(val_config)
                okay = true
                break
            case this.protocollo.getConfigPassw():
                utente.setPassw(val_config)
                okay = true
                break
            default:
                break
        }

        return okay
    }

    //DI SEGUITO CI SONO 3 METODI PER TROVARE UN UTENTE A PARTIRE DA UN SUO DATO UNIVOCO
    // (nickname, IP e socket)
    //Lavorano tutti allo stesso modo: ciclano la lista di utenti (se l'ha trovato non
    // posso usare un "break" xke darebbe errore)

    trovaUtenteDaSocket(socket) {
        let utenteDaTrovare = null
        this.utenti.forEach((utente) => {
            if (utenteDaTrovare == null) {
                if (utente.getSocket() == socket) {
                    utenteDaTrovare = utente
                }
            }
        })
        return utenteDaTrovare
    }
    trovaUtenteDaIP(ip) {
        let utenteDaTrovare = null
        this.utenti.forEach((utente) => {
            if (utenteDaTrovare == null) {
                if (utente.getIP() == ip) {
                    utenteDaTrovare = utente
                }
            }
        })
        return utenteDaTrovare
    }
    trovaUtenteDaNickname(nickname) {
        let utenteDaTrovare = null
        this.utenti.forEach((utente) => {
            if (utenteDaTrovare == null) {
                if (utente.getNickname() == nickname) {
                    utenteDaTrovare = utente
                }
            }
        })
        return utenteDaTrovare
    }
}

module.exports = Utenti
