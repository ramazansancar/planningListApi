import axios from "axios";
import asyncHandler from "express-async-handler";
import http from "http";
import https from "https";
import crypto from "crypto";

import {
    errorMessage,
    successMessage,
    turkTelekomParser,
    gibirParser,
    turkcellParser
} from "../../functions/helpers.js";
import dotenv from "dotenv";
dotenv.config();

const {
    TURKNET_URL,
    TURKNET_REQUEST_METHOD,
    TURKTELEKOM_URL,
    TURKTELEKOM_REQUEST_METHOD,
    GIBIR_URL,
    GIBIR_REQUEST_METHOD,
    TURKCELL_URL,
    TURKCELL_REQUEST_METHOD,
} = process.env;

const turkNetApi = axios.create({
    baseURL: TURKNET_URL,
    method: TURKNET_REQUEST_METHOD,
    timeout: 30000,
    httpAgent: new http.Agent({
        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
        rejectUnauthorized: false,
        keepAlive: true
    }),
    httpsAgent: new https.Agent({
        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
        rejectUnauthorized: false,
        keepAlive: true
    }),
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh-TW;q=0.5,zh;q=0.4,ja;q=0.3,ko;q=0.2",
        "x-pywb-requested-with": "XMLHttpRequest",
        "Referer": "https://turk.net/",
        "Origin": "https://turk.net",
        "Cache-Control": "no-cache",
    },
});

export const getTurkNet = asyncHandler(async (req, res) => {
    try {
        const { data, status } = await turkNetApi.request();

        if(data === null || data === undefined) return errorMessage(res, "TurkNet API is down!", {"params":req.params,"query":req.query}, "TurkNet API is down!", 400);

        if(status !== 200) return errorMessage(res, "TurkNet API is down!", {"params":req.params,"query":req.query}, "TurkNet API is down!", 400);
        
        let plannedOperationInfoList = [];
        if(data.Result.PlannedOperationInfoList !== null && data.Result.PlannedOperationInfoList !== undefined) plannedOperationInfoList = data.Result.PlannedOperationInfoList;
        
        let telecomSsgFaultInfoList = [];
        if(data.Result.TelecomSsgFaultInfoList !== null && data.Result.TelecomSsgFaultInfoList !== undefined) telecomSsgFaultInfoList = data.Result.TelecomSsgFaultInfoList;

        return successMessage(res, {plannedOperationInfoList, telecomSsgFaultInfoList}, "TurkNet API up!", {"params":req.params,"query":req.query}, 200);
    } catch (err) {
        console.log(JSON.stringify(err));
        return errorMessage(res, err.message, {"params":req.params,"query":req.query}, "API Error", 400);
    }
});

const turkTelekomApi = axios.create({
    baseURL: TURKTELEKOM_URL,
    method: TURKTELEKOM_REQUEST_METHOD,
    timeout: 30000,
    httpAgent: new http.Agent({
        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
        rejectUnauthorized: false,
        keepAlive: true,
    }),
    httpsAgent: new https.Agent({
        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
        rejectUnauthorized: false,
        keepAlive: true,
    }),
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        "Content-Type": "application/json; charset=UTF-8;",
        //"Accept": "application/json",
        //"Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh-TW;q=0.5,zh;q=0.4,ja;q=0.3,ko;q=0.2",
        //"x-pywb-requested-with": "XMLHttpRequest",
        //"Referer": "https://turk.net/",
        //"Origin": "https://turk.net",
        "Cache-Control": "no-cache",
    },
});

export const getTurkTelekom = asyncHandler(async (req, res) => {
    const { data, status } = await turkTelekomApi.request({
        //url: "/GetCityDistrictList",
        url: "",
        data: JSON.stringify({"req":{"City":"","District":"","PageNo":1,"PageSize":10000}})
    }).catch((err) => {
        console.log(JSON.stringify(err));
        return errorMessage(res, err.message, {"params":req.params,"query":req.query}, "API Error", 400);
    });

    if(data === null || data === undefined) return errorMessage(res, "Türk Telekom API is down!", {"params":req.params,"query":req.query}, "Türk Telekom API is down!", 400);

    if(status !== 200) return errorMessage(res, "Türk Telekom API is down!", {"params":req.params,"query":req.query}, "Türk Telekom API is down!", 400);

    return successMessage(res, turkTelekomParser(data?.d?.Data), "Türk Telekom API up!", {"params":req.params,"query":req.query}, 200);
});

export const getTurkTelekomCities = asyncHandler(async (req, res) => {
    const mockData = {
        ADANA: ["ALADAĞ", "CEYHAN", "ÇUKUROVA", "FEKE", "İMAMOĞLU", "KARAİSALI", "KARATAŞ", "KOZAN", "POZANTI", "SAİMBEYLİ", "SARIÇAM", "SEYHAN", "TUFANBEYLİ", "YUMURTALIK", "YÜREĞİR"],
        ADIYAMAN: ["ADIYAMAN", "BESNİ", "ÇELİKHAN", "GERGER", "GÖLBAŞI", "KAHTA", "MERKEZ", "SAMSAT", "SİNCİK", "TUT"],
        "AFYONKARAHİSAR": ["AFYONKARAHİSAR", "BAŞMAKÇI", "BAYAT", "BOLVADİN", "ÇAY", "ÇOBANLAR", "DAZKIRI", "DİNAR", "EMİRDAĞ", "EVCİLER", "HOCALAR", "İHSANİYE", "İSCEHİSAR", "KIZILÖREN", "MERKEZ", "SANDIKLI", "SİNANPAŞA", "SULTANDAĞI", "ŞUHUT"],
        "AĞRI": ["AĞRI", "DİYADİN", "DOĞUBAYAZIT", "ELEŞKİRT", "HAMUR", "PATNOS", "TAŞLIÇAY", "TUTAK"],
        AKSARAY: ["AKSARAY", "ALAPLI", "ÇAYCUMA", "DEVREK", "EREĞLİ", "GÖKÇEBEY", "KİLİMLİ", "KOZLU", "MERKEZ"],
        AMASYA: ["GÖYNÜCEK", "GÜMÜŞHACIKÖY", "HAMAMÖZÜ", "MERKEZ", "MERZİFON", "SULUOVA", "TAŞOVA"],
        ANKARA: ["AKYURT", "ALTINDAĞ", "AYAŞ", "BALA", "BEYPAZARI", "ÇAMLIDERE", "ÇANKAYA", "ÇUBUK", "ELMADAĞ", "ETİMESGUT", "EVREN", "GÖLBAŞI", "GÜDÜL", "HAYMANA", "KALECİK", "KAZAN", "KEÇİÖREN", "KIZILCAHAMAM", "MAMAK", "NALLIHAN", "POLATLI", "PURSAKLAR", "SİNCAN", "ŞEREFLİKOÇHİSAR", "YENİMAHALLE"],
        ANTALYA: ["AKSEKİ", "AKSU", "ALANYA", "DEMRE", "DÖŞEMEALTI", "ELMALI", "FİNİKE", "GAZİPAŞA", "GÜNDOĞMUŞ", "İBRADI", "KAŞ", "KEMER", "KEPEZ", "KONYAALTI", "KORKUTELİ", "KUMLUCA", "MANAVGAT", "MURATPAŞA", "SERİK"],
        ARDAHAN: ["ARDAHAN", "ÇILDIR", "DAMAL", "GÖLE", "HANAK", "POSOF"],
        "ARTVİN": ["ARDANUÇ", "ARHAVİ", "BORÇKA", "HOPA", "MERKEZ", "MURGUL", "ŞAVŞAT", "YUSUFELİ"],
        AYDIN: ["AYDIN", "BOZDOĞAN", "BUHARKENT", "ÇİNE", "DİDİM", "EFELER", "GERMENCİK", "İNCİRLİOVA", "KARACASU", "KARPUZLU", "KOÇARLI", "KÖŞK", "KUŞADASI", "KUYUCAK", "NAZİLLİ", "SÖKE", "SULTANHİSAR", "YENİPAZAR"],
        "BALIKESİR": ["ALTIEYLÜL", "AYVALIK", "BALIKESİR", "BALYA", "BANDIRMA", "BİGADİÇ", "BURHANİYE", "DURSUNBEY", "EDREMİT", "ERDEK", "GÖMEÇ", "HAVRAN", "İVRİNDİ", "KARESİ", "KEPSUT", "MANYAS", "MARMARA", "SAVAŞTEPE", "SINGIRDI", "SUSURLUK"],
        BARTIN: ["AMASRA", "BARTIN", "KURUCAŞİLE", "ULUS"],
        BATMAN: ["BATMAN", "BEŞİRİ", "GERCÜŞ", "HASANKEYF", "KOZLUK", "SASON"],
        BAYBURT: ["AYDINTEPE", "BAYBURT", "DEMİRÖZÜ"],
        "BİLECİK": ["BİLECİK", "BOZÜYÜK", "GÖLPAZARI", "İNHİSAR", "OSMANELİ", "PAZARYERİ", "SÖGÜT", "YENİPAZAR"],
        "BİNGÖL": ["ADAKLI", "BİNGÖL", "GENÇ", "KARLIOVA", "KİĞI", "MERKEZ", "SOLHAN", "YAYLADERE", "YEDİSU"],
        "BİTLİS": ["ADİLCEVAZ", "AHLAT", "GÜROYMAK", "HİZAN", "MERKEZ", "MUTKİ", "TATVAN"],
        BOLU: ["BOLU", "DÖRTDİVAN", "GEREDE", "GÖYNÜK", "KIBRISCIK", "MENGEN", "MUDURNU", "SEBEN", "YENİÇAĞA"],
        BURDUR: ["AĞLASUN", "ALTINYAYLA", "BUCAK", "BURDUR", "ÇAVDIR", "ÇELTİKÇİ", "GÖLHİSAR", "KARAMANLI", "KEMER", "MERKEZ", "TEFENNİ", "YEŞİLOVA"],
        BURSA: ["BÜYÜKORHAN", "GEMLİK", "GÜRSU", "HARMANCIK", "İNEGÖL", "İZNİK", "KARACABEY", "KELES", "KESTEL", "MUDANYA", "MUSTAFAKEMALPAŞA", "NİLÜFER", "ORHANELİ", "ORHANGAZİ", "OSMANGAZİ", "YENİŞEHİR", "YILDIRIM"],
        "ÇANAKKALE": ["AYVACIK", "BAYRAMİÇ", "BİGA", "BOZCAADA", "ÇAN", "ÇANAKKALE", "ECEABAT", "EZİNE", "GELİBOLU", "GÖKÇEADA", "LAPSEKİ", "MERKEZ", "YENİCE", ],
        "ÇANKIRI": ["ATKARACALAR", "BAYRAMÖREN", "ÇANKIRI", "ÇERKEŞ", "ELDİVAN", "ILGAZ", "KIZILIRMAK", "KORGUN", "KURŞUNLU", "ORTA", "ŞABANÖZÜ", "YAPRAKLI"],
        "ÇORUM": ["ALACA", "BAYAT", "BOĞAZKALE", "ÇORUM", "DODURGA", "İSKİLİP", "KARGI", "LAÇİN", "MECİTÖZÜ", "MERKEZ", "OĞUZLAR", "ORTAKÖY", "OSMANCIK", "SUNGURLU", "UĞURLUDAĞ"],
        "DENİZLİ": ["ACIPAYAM", "BABADAĞ", "BAKLAN", "BEKİLLİ", "BEYAĞAÇ", "BOZKURT", "BULDAN", "ÇAL", "ÇAMELİ", "ÇARDAK", "ÇİVRİL", "DENİZLİ", "GÜNEY", "HONAZ", "KALE", "MERKEZEFENDİ", "PAMUKKALE", "SARAYKÖY", "SERİNHİSAR", "TAVAS"],
        "DİYARBAKIR": ["BAĞLAR", "BİSMİL", "ÇERMİK", "ÇINAR", "ÇÜNGÜŞ", "DİCLE", "EĞİL", "ERGANİ", "HANİ", "HAZRO", "KAYAPINAR", "KOCAKÖY", "KULP", "LİCE", "SİLVAN", "SUR", "YENİŞEHİR"],
        "DÜZCE": ["AKÇAKOCA", "CUMAYERİ", "ÇİLİMLİ", "DÜZCE", "GÖLYAKA", "GÜMÜŞOVA", "KAYNAŞLI", "MERKEZ", "YIĞILCA"],
        "EDİRNE": ["EDİRNE", "ENEZ", "HAVSA", "İPSALA", "KEŞAN", "LALAPAŞA", "MERKEZ", "MERİÇ", "SÜLOĞLU", "UZUNKÖPRÜ"],
        "ELAZIĞ": ["AĞIN", "ALACAKAYA", "ARICAK", "BASKİL", "KARAKOÇAN", "EBAN", "ELAZIĞ", "KOVANCILAR", "MADEN", "MERKEZ", "PALU", "SİVRİCE"],
        "ERZİNCAN": ["ÇAYIRLI", "ERZİNCAN", "İLİÇ", "KEMAH", "KEMALİYE", "MERKEZ", "OTLUKBELİ", "REFAHİYE", "TERCAN", "ÜZÜMLÜ"],
        ERZURUM: ["AŞKALE", "AZİZİYE", "ÇAT", "HINIS", "HORASAN", "İSPİR", "KARAÇOBAN", "KARAYAZI", "KÖPRÜKÖY", "NARMAN", "OLTU", "OLUR", "PALANDÖKEN", "PASİNLER", "PAZARYOLU", "ŞENKAYA", "TEKMAN", "TORTUM", "UZUNDERE"],
        "ESKİŞEHİR": ["ALPU", "BEYLİKOVA", "ÇEFTELER", "GÜNYÜZÜ", "HAN", "İNÖNÜ", "MAHMUDİYE", "MİHALGAZİ", "MİHALIÇÇIK", "ODUNPAZARI", "SARICAKAYA", "SEYİTGAZİ", "SİVRİHİSAR", "TEPEBAŞI"],
        "GAZİANTEP": ["ARABAN", "İSLAHİYE", "KARKAMIŞ", "NİZİP", "NURDAĞI", "OĞUZELİ", "ŞAHİNBEY", "ŞEHİTKAMİL", "YAVUZELİ"],
        "GİRESUN": ["ALUCRA", "BULANCAK", "ÇAMOLUK", "ÇANAKÇI", "DERELİ", "DOĞANKENT", "ESPİYE", "EYNESİL", "GİRESUN", "GÖRELE", "GÜCE", "KEŞAP", "PİRAZİZ", "ŞEBİNKARAHİSAR", "TİREBOLU", "YAĞLIDERE"],
        "GÜMÜŞHANE": ["GÜMÜŞHANE", "KELKİT", "KÖSE", "KÜRTÜN", "ŞİRAN", "TORUL"],
        "HAKKARİ": ["ÇUKURCA", "HAKKARİ", "MERKEZ", "ŞEMDİNLİ", "YÜKSEKOVA"],
        HATAY: ["ALTINÖZÜ", "ANTAKYA", "ARSUZ", "BELEN", "DEFNE", "DÖRTYOL", "ERZİN", "HASSA", "HATAY", "İSKENDERUN", "KIRKHAN", "KUMLU", "PAYAS", "REYHANLI", "SAMANDAĞ", "YAYLADAĞI"],
        "IĞDIR": ["ARALIK", "IĞDIR", "KARAKOYUNLU", "MERKEZ", "TUZLUCA"],
        ISPARTA: ["AKSU", "ATABEY", "EĞİRDİR", "GELENDOST", "GÖNEN", "ISPARTA", "KEÇİBORLU", "MERKEZ", "SENİRKENT", "SÜTÇÜLER", "ŞARKİKARAAĞAÇ", "ULUBORLU", "YALVAÇ", "YENİŞARBADEMLİ"],
        "İSTANBUL": ["ADALAR", "ARNAVUTKÖY", "ATAŞEHİR", "AVCILAR", "BAĞCILAR", "BAHÇELİEVLER", "BAKIRKÖY", "BAŞAKŞEHİR", "BAYRAMPAŞA", "BEŞİKTAŞ", "BEYKOZ", "BEYLİKDÜZÜ", "BEYOĞLU", "BÜYÜKÇEKMECE", "ÇATALCA", "ÇEKMEKÖY", "ESENLER", "ESENYURT", "EYÜP", "FATİH", "GAZİOSMANPAŞA", "GÜNGÖREN", "KADIKÖY", "KAĞITHANE", "KARTAL", "KÜÇÜKÇEKMECE", "MALTEPE", "PENDİK", "SANCAKTEPE", "SARIYER", "SİLİVRİ", "SULTANBEYLİ", "SULTANGAZİ", "ŞİLE", "ŞİŞLİ", "TUZLA", "ÜMRANİYE", "ÜSKÜDAR", "ZEYTİNBURNU"],
        "İZMİR": ["ALİAĞA", "BALÇOVA", "BAYINDIR", "BAYRAKLI", "BERGAMA", "BEYDAĞ", "BORNOVA", "BUCA", "ÇEŞME", "ÇİĞLİ", "DİKİLİ", "FOÇA", "GAZİEMİR", "GÜZELBAHÇE", "KARABAĞLAR", "KARABURUN", "KARŞIYAKA", "KEMALPAŞA", "KINIK", "KİRAZ", "KONAK", "MENDERES", "MENEMEN", "NARLIDERE", "ÖDEMİŞ", "SEFERİHİSAR", "SELÇUK", "TİRE", "TORBALI", "URLA"],
        "KAHRAMANMARAŞ": ["AFŞİN", "ANDIRIN", "ÇAĞLAYANCERİT", "DULKADİROĞLU", "EKİNÖZÜ", "ELBİSTAN", "GÖKSUN", "KAHRAMANMARAŞ", "NURHAK", "ONİKİŞUBAT", "PAZARCIK", "TÜRKOĞLU"],
        "KARABÜK": ["EFLANİ", "ESKİPAZAR", "KARABÜK", "OVACIK", "SAFRANBOLU", "YENİCE"],
        KARAMAN: ["AYRANCI", "BAŞYAYLI", "ERMENEK", "MERKEZ", "KARAMAN", "KAZIMKARABEKİR", "SARIVELİLER"],
        KARS: ["AKYAKA", "ARPAÇAY", "DİGOR", "KAĞIZMAN", "KARS", "SARIKAMIŞ", "SELİM", "SUSUZ"],
        KASTAMONU: ["ABANA", "AĞLI", "ARAÇ", "AZDAVAY", "BOZKURT", "CİDE", "ÇATALZEYTİN", "DADAY", "DEVREKANİ", "DOĞANYURT", "HANÖNÜ", "İHSANGAZİ", "İNEBOLU", "KASTAMONU", "KÜRE", "PINARBAŞI", "SEYDİLER", "ŞENPAZAR", "TAŞKÖPRÜ", "TOSYA"],
        "KAYSERİ": ["AKKIŞLA", "BÜNYAN", "DEVELİ", "FELAHİYE", "HACILAR", "İNCESU", "KOCASİNAN", "MELİKGAZİ", "ÖZVATAN", "PINARBAŞI", "SAOĞLAN", "SARIZ", "TALAS", "TOMARZA", "YAHYALI", "YEŞİLHİSAR"],
        KIRIKKALE: ["BAHŞİLİ", "BALIŞEYH", "ÇELEBİ", "DELİCE", "KARAKEÇİLİ", "KIRIKKALE", "KESKİN", "SULAKYURT", "YAHŞİHAN"],
        "KIRKLARELİ": ["BABAESKİ", "DEMİRKÖY", "KIRKLARELİ", "KOFÇAZ", "LÜLEBURGAZ", "PEHLİVANKÖY", "PINARHİSAR", "VİZE"],
        "KIRŞEHİR": ["AKÇAKENT", "AKPINAR", "BOZTEPE", "ÇİÇEKDAĞI", "KAMAN", "KIRŞEHİR", "MERKEZ", "MUCUR"],
        "KİLİS": ["ELBEYLİ", "MUSABEYLİ", "KİLİS", "POLATELİ"],
        "KOCAELİ": ["BAŞİSKELE", "ÇAYIROVA", "DARICA", "DERİNCE", "DİLOVASI", "GEBZE", "GÖLCÜK", "İZMİT", "KANDIRA", "KARAMÜRSEL", "KARTEPE", "KÖRFEZ"],
        KONYA: ["AHIRLI", "AKÖREN", "AKŞEHİR", "ALTINEKİN", "BEYŞEHİR", "BOZKIR", "CİHANBEYLİ", "ÇELTİK", "ÇUMRA", "DERBENT", "DEREBUCAK", "DOĞANHİSAR", "EMİRGAZİ", "EREĞLİ", "GÜNEYSINIR", "HADİM", "HALKAPINAR", "HÜYÜK", "ILGIN", "KADINHANİ", "KARAPINAR", "KARATAY", "KULU", "MERAM", "SARAKÖYÜ", "SELÇUKLU", "SEYDİŞEHİR", "TAŞKENT", "TUZLUKÇU", "YALIHÜYÜK", "YUNAK"],
        "KÜTAHYA": ["ALTINTAŞ", "ASLANAPA", "ÇAVDARHİSAR", "DOMANİÇ", "DUMLUPINAR", "EMET", "GEDİZ", "HİSARCIK", "MERKEZ", "KÜTAHYA", "PAZARLAR", "SİMAV", "ŞARAPHANE", "TAVŞANLI"],
        MALATYA: ["AKÇADAĞ", "ARAPGİR", "ARGUVAN", "BATTALGAZİ", "DARENDE", "DOĞANŞEHİR", "DOĞANYOL", "HEKİMHAN", "MERKEZ", "KALE", "KULUNCAK", "PÜTÜRGE", "YAZIHAN", "YEŞİLYURT"],
        "MANİSA": ["AHMETLİ", "AKHİSAR", "ALAŞEHİR", "DEMİRCİ", "GÖLMARMARA", "GÖRDES", "MANİSA", "KIRKAĞAÇ", "KÖPRÜBAŞI", "KULA", "SALİHLİ", "SARIGÖL", "SARUHANLI", "SELENDİ", "SOMA", "ŞEHZADELER", "TURGUTLU", "YUNUSEMRE"],
        "MARDİN": ["ARTUKLU", "DARGEÇİT", "DERİK", "KIZILTEPE", "MARDİN", "MAZIDAĞI", "MİDYAT", "NUSAYBİN", "ÖMERLİ", "SAVUR", "YEŞİLLİ"],
        "MERSİN": ["AKDENİZ", "ANAMUR", "AYDINCIK", "BOZYAZI", "ÇAMLIYAYLA", "ERDEMLİ", "GÜLNAR", "MEZİTLİ", "MUT", "SİLİFKE", "TARSUS", "TOROSLAR", "YENİŞEHİR"],
        "MUĞLA": ["BODRUM", "DALAMAN", "DATÇA", "FETHİYE", "KAVAKLIDERE", "KÖYCEĞİZ", "MARMARİS", "MENTEŞE", "MİLAS", "MUĞLA", "ORTACA", "SEYDİKEMER", "ULA", "YATAĞAN"],
        "MUŞ": ["BULANIK", "HASKÖY", "KORKUT", "MALAZGİRT", "MERKEZ", "MUŞ", "VARTO"],
        "NEVŞEHİR": ["ACIGÖL", "AVANOS", "DERİNKUYU", "GÜLŞEHİR", "HACIBEKTAŞ", "KOZAKLI", "MERKEZ", "NEVŞEHİR", "ÜRGÜP"],
        "NİĞDE": ["ALTUNHİSAR", "BOR", "ÇAMARDI", "ÇİFTLİK", "NİĞDE", "ULUKIŞLA"],
        ORDU: ["AKKUŞ", "ALTINORDU", "AYBASTI", "ÇAMAŞ", "ÇATALPINAR", "ÇAYBAŞI", "FATSA", "GÖLKÖY", "GÜLYALI", "GÜRGENTEPE", "İKİZCE", "KABADÜZ", "KABATAŞ", "KORGAN", "KUMRU", "MESUDİYE", "ORDU", "PERŞEMBE", "ULUBEY", "ÜNYE"],
        "OSMANİYE": ["BAHÇE", "DÜZİÇİ", "HASANBEYLİ", "KADİRLİ", "MERKEZ", "OSMANİYE", "SUMBAS", "TOPRAKKALE"],
        "RİZE": ["ARDEŞEN", "ÇAMLIHEMŞİN", "ÇAYELİ", "DEREPAZARI", "FINDIKLI", "GÜNEYSU", "HEMŞİN", "İKİZDERE", "İYİDERE", "KALKANDERE", "MERKEZ", "PAZAR", "RİZE"],
        SAKARYA: ["ADAPAZARI", "AKYAZI", "ARİFİYE", "ERENLER", "FERİZLİ", "GEYVE", "HENDEK", "KARAPÜRÇEK", "KARASU", "KAYNARCA", "KOCAALİ", "PAMUKOVA", "SAPANCA", "SERDİVAN", "SÖĞÜTLÜ", "TARAKLI"],
        SAMSUN: ["19 MAYIS", "ALAÇAM", "ASARCIK", "ATAKUM", "AYVACIK", "BAFRA", "CANİK", "ÇARŞAMBA", "HAVZA", "İLKADIM", "KAVAK", "LADİK", "SALIPAZARI", "TEKKEKÖY", "TERME", "VEZİRKÖPRÜ", "YAKAKENT"],
        "SİİRT": ["BAYKAN", "ERUH", "KURTALAN", "PERVARİ", "SİİRT", "ŞİRVAN", "TİLLO"],
        "SİNOP": ["AYANCIK", "BOYABAT", "DİKMEN", "DURAĞAN", "ERFELEK", "GERZE", "SARAYDÜZÜ", "SİNOP", "TÜRKELİ"],
        "SİVAS": ["AKINCILAR", "ALTINYAYLA", "DİVRİĞİ", "DOĞANŞAR", "GEMEREK", "GÖLOVA", "GÜRÜN", "HAFİK", "İMRANLI", "KANGAL", "KOYULHİSAR", "MERKEZ", "SİVAS", "SUŞEHRİ", "ŞARKIŞLA", "ULAŞ", "YILDIZELİ", "ZARA"],
        "ŞANLIURFA": ["AKÇAKALE", "BİRECİK", "BOZOVA", "CEYLANPINAR", "EYYÜBİYE", "HALFETİ", "HALİLİYE", "HARRAN", "HİLVAN", "KARAKÖPRÜ", "SİVEREK", "SURUÇ", "VİRANŞEHİR"],
        "ŞIRNAK": ["BEYTÜŞŞEBAP", "CİZRE", "GÜÇLÜKONAK", "İDİL", "SİLOPİ", "ŞIRNAK", "ULUDERE"],
        "TEKİRDAĞ": ["ÇERKEZKÖY", "ÇORLU", "ERGENE", "HAYRABOLU", "KAPAKLI", "MALKARA", "MARMARAEREĞLİSİ", "MURATLI", "SARAY", "SÜLEYMANPAŞA", "ŞARKÖY", "TEKİRDAĞ"],
        TOKAT: ["ALMUS", "ARTOVA", "BAŞÇİFTLİK", "ERBAA", "MERKEZ", "NİKSAR", "PAZAR", "REŞADİYE", "SULUSARAY", "TOKAT", "TURHAL", "YEŞİLYURT", "ZİLE"],
        TRABZON: ["AKÇAABAT", "ARAKLI", "ARSİN", "BEŞİKDÜZÜ", "ÇARŞIBAŞI", "ÇAYKARA", "DERNEKPAZARI", "DÜZKÖY", "HAYRAT", "KÖPRÜBAŞI", "MAÇKA", "OF", "ORTAHİSAR", "SÜRMENE", "ŞALPAZARI", "TONYA", "TRABZON", "VAKFIKEBİR", "YOMRA"],
        "TUNCELİ": ["ÇEMİŞGEZEK", "HOZAT", "MAZGİRT", "NAZİMİYE", "OVACIK", "PERTEK", "PÜLÜMÜR", "TUNCELİ"],
        "UŞAK": ["BANAZ", "EŞME", "KARAHALLI", "SİVASLI", "ULUBEY", "UŞAK"],
        VAN: ["BAHÇESARAY", "BAŞKALE", "ÇALDIRAN", "ÇATAK", "EDREMİT", "ERCİŞ", "GEVAŞ", "GÜRPINAR", "İPEKYOLU", "MURADİYE", "ÖZALP", "SARAY", "TUŞBA", "VAN"],
        YALOVA: ["ALTINOVA", "ARMUTLU", "ÇINARCIK", "ÇİFTLİKKÖY", "TERMAL", "YALOVA"],
        YOZGAT: ["AKDAĞMADENİ", "AYDINCIK", "BOĞAZLIYAN", "ÇANDIR", "ÇAYIRALAN", "ÇEKERE", "KADIŞEHRİ", "MERKEZ", "SARAYKENT", "SARIKAYA", "SORGUN", "ŞEFAATLİ", "YENİFAKILI", "YERKÖY", "YOZGAT"],
        ZONGULDAK: ["ALAPLI", "ÇAYCUMA", "DEVREK", "EREĞLİ", "GÖKÇEBEY", "KİLİMLİ", "KOZLU", "ZONGULDAK"]
    }

    return successMessage(res, mockData, "Türk Telekom Cities", {"params":req.params,"query":req.query}, 200);
});

const gibirApi = axios.create({
    baseURL: GIBIR_URL,
    headers: {
        //"Content-Type": "application/json",
        //"Accept": "application/json",
        "Cache-Control": "no-cache",
    },
});

export const getGibir = asyncHandler(async (req, res) => {
    const { data, status } = await gibirApi.request({
        method: GIBIR_REQUEST_METHOD,
    }).catch((err) => {
        console.log(JSON.stringify(err));
        return errorMessage(res, err.message, {"params":req.params,"query":req.query}, "API Error", 400);
    });

    if(data === null || data === undefined) return errorMessage(res, "Gibir API is down!", {"params":req.params,"query":req.query}, "Gibir API is down!", 400);

    if(status !== 200) return errorMessage(res, "Gibir API is down!", {"params":req.params,"query":req.query}, "Gibir API is down!", 400);

    return successMessage(res, gibirParser(data), "Gibir API up!", {"params":req.params,"query":req.query}, 200);
});

const turkcellApi = axios.create({
    baseURL: TURKCELL_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Accept-Language": "tr,en-US;q=0.9,en;q=0.8,tr-TR;q=0.7,zh-CN;q=0.6,zh-TW;q=0.5,zh;q=0.4,ja;q=0.3,ko;q=0.2,bg;q=0.1",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Origin": "https://www.turkcell.com.tr",
        "Referer": "https://www.turkcell.com.tr/trc/hakkimizda/duyurular/planli-calisma-bilgilendirme",
    },
    timeout: 30000
});

export const getTurkcell = asyncHandler(async (req, res) => {
    const { data, status } = await turkcellApi.request({
        method: TURKCELL_REQUEST_METHOD
    }).catch((err) => {
        console.log(JSON.stringify(err));
        return errorMessage(res, err.message, {"params":req.params,"query":req.query}, "Turkcell API is down!", 400);
    });

    if(data === null || data === undefined) return errorMessage(res, "Turkcell API is down!", {"params":req.params,"query":req.query}, "Turkcell API is down!", 400);

    if(status !== 200) return errorMessage(res, "Turkcell API is down!", {"params":req.params,"query":req.query}, "Turkcell API is down!", 400);

    return successMessage(res, turkcellParser(data?.data), "Turkcell API up!", {"params":req.params,"query":req.query}, 200);
});
