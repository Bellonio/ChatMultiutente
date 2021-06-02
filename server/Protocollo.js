class Protocollo {
    constructor() {
        this.nickname = "#config#nickname:"
        this.timeout = "#config#timeout:"
        this.away = "#config#away_message:"
        this.passw = "#config#passw:"
    }

    getConfigNickname() { return this.nickname }
    getConfigTimeout() { return this.timeout }
    getConfigAway() { return this.away }
    getConfigPassw() { return this.passw }

    controllaConfigurazione(utente, socket) {
        //metodo che ritorna true se l'utente passato come primo parametro ha terminato la
        // configurazione

        if (utente.getNickname() != null && utente.getTimeout() != null &&
            utente.getAwayMsg() != null && utente.getPassw() != null) {

            utente.setUtenteConfigurato()
            //finito la configurazione nell'app passa alla chat
            return true
        } else {
            return false
        }
    }

}

module.exports = Protocollo
