/* jshint esversion:6 */

function othello() {
    "use strict";

    let Steen = {
        leeg: 0,
        zwart: 1,
        wit: 2,
        vijand: kleur => {
            return kleur === Steen.wit ? Steen.zwart : kleur === Steen.zwart ? Steen.wit : kleur;
        }
    };
    
    class Positie {
        constructor(rij, kol) {
            this.rij = rij;
            this.kol = kol;
        };
    }
    
    class Richting {
        constructor(naam, deltaRij, deltaKol) {
            this.naam = naam;
            this.deltaRij = deltaRij;
            this.deltaKol = deltaKol;
        }
    }

    let richtingen = [
        new Richting("noord", -1, 0),
        new Richting("noordoost", -1, 1),
        new Richting("oost", 0, 1),
        new Richting("zuidoost", 1, 1),
        new Richting("zuid", 1, 0),
        new Richting("zuidwest", 1, -1),
        new Richting("west", 0, -1),
        new Richting("noordwest", -1, -1)
    ];

    class Bord {
        constructor(rijen, kolommen) {
            this.rijen = rijen;
            this.kolommen = kolommen;
            this.stenen = getStenen();

            function getStenen() {
                let result = [];
                for (let rij = 0; rij < rijen; rij++) {
                    result.push([]);
                    for (let kol = 0; kol < kolommen; kol++) {
                        result[rij].push(Steen.leeg);
                    }
                }
                return result;
            }
        }

        isGeldigeZet(rij, kol, kleur) {
            return this.isInBord(rij, kol) &&
                this.isLeeg(rij, kol) &&
                this.sluitVijandIn(rij, kol, kleur).length > 0;
        }

        isInBord(rij, kol) {
            return ((rij >= 0 && rij < this.rijen) &&
                    (kol >= 0 && kol < this.kolommen));
        }

        isLeeg(rij, kol) {
            return (this.stenen[rij][kol] === Steen.leeg);
        }        

        sluitVijandIn(rij, kol, kleur) {
            let ingeslotenStenen = [];
            for (const richting of richtingen) {
                ingeslotenStenen =  ingeslotenStenen.concat(this.sluitVijandInRichting(richting, rij, kol, kleur));
            }
            return ingeslotenStenen;
        }

        sluitVijandInRichting(richting, rij, kol, kleur) {
            let vijand = Steen.vijand(kleur);
            let ingeslotenStenenRichting = [];
                do {
                    rij += richting.deltaRij;
                    kol += richting.deltaKol;
                    if (this.isInBord(rij, kol) && this.stenen[rij][kol] === vijand){
                        ingeslotenStenenRichting.push(new Positie(rij, kol));
                    }
    
                } while (this.isInBord(rij, kol) && this.stenen[rij][kol] === vijand)                      

            if (this.isInBord(rij, kol) && (this.stenen[rij][kol] === kleur)) {
                return ingeslotenStenenRichting;
            }
            else {
                ingeslotenStenenRichting.length = 0;
                return ingeslotenStenenRichting;
            }
        }

        initBord() {
            let rij = this.rijen / 2 - 1;
            let kol = this.kolommen / 2 - 1;
            this.stenen[rij][kol] = Steen.wit;
            this.stenen[rij + 1][kol + 1] = Steen.wit;
            this.stenen[rij + 1][kol] = Steen.zwart;
            this.stenen[rij][kol + 1] = Steen.zwart;
        }

        doeZet(rij, kol, speler){
            let ingeslotenStenen = this.sluitVijandIn(rij, kol, speler.kleur);
            for (let i = 0; i < ingeslotenStenen.length; i++) {
                let vijandRij = ingeslotenStenen[i].rij;
                let vijandKol = ingeslotenStenen[i].kol;
                this.stenen[vijandRij][vijandKol] = speler.kleur;                
            }
            this.stenen[rij][kol] = speler.kleur;
        }

        tekenMogelijkeZetten(tabel, speler) {
            ctx.globalAlpha = 0.18;
            for (let i = 0; i < tabel.length; i++) {
                tekenSteen(tabel[i].rij, tabel[i].kol, speler.kleur);
            }
        }
    }

    class Speler {
        constructor(kleur, niveau) {
            this.kleur = kleur;
            this.niveau = niveau;
        }
        
        kanZetDoen(bord) {
            for (let rij = 0; rij < bord.rijen; rij++) {
                for (let kol = 0; kol < bord.kolommen; kol++) {
                    if (bord.isGeldigeZet(rij, kol, this.kleur)){
                        return true;
                    }
                }
            }
            return false;
        }

    }

    class Partij {
        constructor(bord, spelerZwart, spelerWit, spelerAanZet){
            this.bord = bord;
            this.spelerZwart = spelerZwart;
            this.spelerWit = spelerWit;
            this.spelerAanZet = spelerAanZet;
        }
        
        beurtNaarTegenStander() {
            this.spelerAanZet = this.spelerAanZet === spelerZwart ? spelerWit : spelerZwart;
        }

        spelerAanZetKanZetDoen() {
            for (let rij = 0; rij < this.bord.rijen; rij++) {
                for (let kol = 0; kol < this. bord.kolommen; kol++) {
                    if (bord.isGeldigeZet(rij, kol, this.spelerAanZet.kleur)){
                        return true;
                    }
                }
            }
            return false;
        }

        kiesWinnaar() {
            let eindscoreWit = this.bord.stenen.flat().filter(steen => steen === Steen.wit).length;
            let eindscoreZwart = this.bord.stenen.flat().filter(steen => steen === Steen.zwart).length;
            AanZetTekst.innerHTML = "Partij afgelopen: ";
            KleurTekst.innerHTML =  (eindscoreWit > eindscoreZwart) ? "Wit wint" :
                                    (eindscoreWit < eindscoreZwart) ? "Zwart wint" : "Gelijkspel";
            document.getElementById("buttonOthello").style.display = "inline-block";
        }
    }

    /* -------------------------------------------------------------------- 
                                start othello
     -------------------------------------------------------------------- */

    let keuzeZwart = document.getElementById("keuzeSpelerZwart").value;
    let keuzeWit = document.getElementById("keuzeSpelerWit").value;
    let keuzeBord = (document.getElementById("keuzeBordGrootte").value).split('x');
    let keuzeRij = +keuzeBord[0];
    let keuzeKolom = +keuzeBord[1];

    let bord = new Bord(keuzeRij, keuzeKolom);
    let spelerZwart = new Speler(Steen.zwart, keuzeZwart);
    let spelerWit = new Speler(Steen.wit, keuzeWit);

    let partij = new Partij(bord, spelerZwart, spelerWit, spelerZwart);

    const grootte = 50;

    let canvas = document.getElementById("bordCanvas");
    let ctx = canvas.getContext("2d");
    canvas.addEventListener("click", bordKlik, false);

    canvas.width = grootte * bord.kolommen;
    canvas.height = grootte * bord.rijen;

    bord.initBord();
    tekenBord();
    updateScores();
    initUI();

    speelspel(partij);

    async function speelspel(partij){
        while (partij.spelerZwart.kanZetDoen(partij.bord) || partij.spelerWit.kanZetDoen(partij.bord)) {
            if (partij.spelerAanZetKanZetDoen()) {
                let mogelijkeZetten = verzamelZetten(partij.bord, partij.spelerAanZet);
                bord.tekenMogelijkeZetten(mogelijkeZetten, partij.spelerAanZet);
                if (spelerIsComputer(partij.spelerAanZet)){
                    await sleep(400);
                    doeComputerZet(mogelijkeZetten, partij.spelerAanZet);      
                }
                else {
                    let steenCount = bord.stenen.flat().filter(steen => steen === partij.spelerAanZet.kleur).length;
                    while (steenCount == bord.stenen.flat().filter(steen => steen === partij.spelerAanZet.kleur).length) {
                        await sleep(300);
                    }
                }      
            }
            updateScores();
            partij.beurtNaarTegenStander();
            updateSpelerAanZet(partij.spelerAanZet);
        }
        partij.kiesWinnaar();
    }

    function initUI(){
        AanZetTekst.innerHTML = "Kleur aan zet: ";
        KleurTekst.innerHTML = "Zwart";
        document.getElementById("buttonOthello").style.display = "none";
    }

    function spelerIsComputer(speler){
        return speler.niveau.includes("Computer");           
    }

    function sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    function doeComputerZet(tabel, speler){
        let zet = kieszet(tabel);
        bord.doeZet(zet.rij, zet.kol, speler);
        tekenBord();
    }

    function verzamelZetten(bord, speler) {
        let verzamelZetten = [];
        for (let rij = 0; rij < bord.rijen; rij++) {
            for (let kol = 0; kol < bord.kolommen; kol++) {
                if (bord.isGeldigeZet(rij, kol, speler.kleur)) {
                    verzamelZetten.push(new Positie(rij, kol));
                }
            }                
        }
        return verzamelZetten;
    }

    function kieszet(tabelMogelijkeZetten) {
        let randomindex = Math.floor(Math.random()*tabelMogelijkeZetten.length);
        return tabelMogelijkeZetten[randomindex];
    }

    function updateScores() {
        WitScore.innerHTML = bord.stenen.flat().filter(steen => steen === Steen.wit).length;
        ZwartScore.innerHTML = bord.stenen.flat().filter(steen => steen === Steen.zwart).length;
    }

    function updateSpelerAanZet(speler){
        KleurTekst.innerHTML = speler.kleur === Steen.zwart ? "Zwart" : "Wit";
    }

    function tekenBord() {
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = "silver";
        for (let rij = 0; rij < bord.rijen; rij++) {
            for (let kol = 0; kol < bord.kolommen; kol++) {
                tekenVak(rij, kol);
                let steen = bord.stenen[rij][kol];
                if (steen === Steen.wit || steen === Steen.zwart) {
                    tekenSteen(rij, kol, steen);
                }
            }
        }
    }

    function tekenSteen(rij, kol, steen) {
        let straal = grootte / 5 * 2;
        let offset = grootte / 2;
        ctx.beginPath();
        ctx.fillStyle = steen === Steen.wit ? "white" : "black";
        ctx.arc(kol * grootte + offset, rij * grootte + offset, straal, 0, Math.PI * 2);
        ctx.fill();
    }

    function tekenVak(rij, kol) {
        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.rect(kol * grootte, rij * grootte, grootte, grootte);
        ctx.stroke();
        ctx.fill();
    }

    function bordKlik() {
        let x = event.pageX - canvas.offsetLeft;
        let y = event.pageY - canvas.offsetTop;
        let rij = Math.floor(y / grootte);
        let kol = Math.floor(x / grootte);
        
        if (bord.isGeldigeZet(rij, kol, partij.spelerAanZet.kleur)) {
            bord.doeZet(rij, kol, partij.spelerAanZet);
            tekenBord();
        }       
    }
}

const setUp = () => {
    document.getElementById("buttonOthello").addEventListener("click", othello);
};

window.addEventListener('load', setUp);