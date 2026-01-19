// Constant: functions/helpers.js
import { JSDOM } from "jsdom";
const languageCode = "tr-TR";
const timeZoneString = "Europe/Istanbul";

export const nowTime = (i = 1) => {
    const dates = new Date().toLocaleString('tr-TR', {
        timeZone: 'Europe/Istanbul',
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
    if (i === 1) return dates.replace(/(\d+)\.(\d+)\.(\d+)\s(\d+):(\d+):(\d+)/, "$1/$2/$3 $4:$5:$6")
    else if (i === 2) return dates.replace(/(\d+)\.(\d+)\.(\d+)\s(\d+):(\d+):(\d+)/, "$1-$2-$3_$4-$5-$6")
    else return dates.replace(/(\d+)\.(\d+)\.(\d+)\s(\d+):(\d+):(\d+)/, "$3-$2-$1_$4-$5-$6");
};

String.prototype.dateConverter = function () {
    return new Date(this.replace(/(\d+)\.(\d+)\.(\d+)\s(\d+):(\d+):(\d+)/, "$3-$2-$1T$4:$5:$6.000Z"));
};

const replaceAll = (str, find, replace) => {
    var target = str
    return target.replace(new RegExp(find, 'g'), replace);
}

const nullCheck = (value) => {
    if (typeof value === "string") {
        value = value.trim()
        value.replace(/(\r\n|\n|\r)/gm, "");
        // 2 space conver to 1 space
        value = value.replace(/  +/g, ' ');
    }
    return (value === null || value === undefined || value === "" || value === "null" || value === "undefined" || value === "NaN" || value === NaN || value === " " || value === '-') ? null : value;
}

const booleanParser = (data) => {
    if (typeof data === "string") {
        data = data.trim()
        data = parseInt(data)
    }
    if (typeof data === "boolean") {
        return data
    }

    return (data === 1) ? true : false;
};

const unicodeToString = (text) => {
    text = nullCheck(text)
    if (text != null) return text.replace(/\\u[\dA-F]{4}/gi,
        function (match) {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
        }
    );
}

export {
    replaceAll,
    nullCheck,
    booleanParser,
    unicodeToString,
}

export const errorMessage = (res, message, parameters = {}, result = {}, status = 400, errorCode = null) => {
    if (typeof status === "string" || status === null || status === "") {
        status = 400
    }
    return res
        .status(status)
        .json({
            success: false,
            message,
            parameters,
            errorCode,
            result
        })
}

export const successMessage = (res, data, message = "request successful.", parameters = {}, status = 200) => {
    if (typeof status === "string" || status === null || status === "") {
        status = 200
    }

    return res
        .status(status)
        .json({
            success: true,
            message,
            parameters,
            data
        })
}

export const convertTimestamp = (date, languageCode, timeZoneString) => {
    const dateObject = new Date(date * 1000);
    return dateObject.toLocaleString(languageCode, { timeZone: timeZoneString })
}

export const turkTelekomParser = (data) => {
    String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };
    data = data.replaceAll("\n", "");
    let tempData = new JSDOM(data).window.document.querySelector(".planned-action-block");
    tempData = tempData.querySelectorAll(".planned-action-item");
    let tempArray = [];

    tempData.forEach((item) => {
        let tempObject = {};
        let fullDate = nullCheck(item.querySelector("div.date > span").innerHTML)
        tempObject.date = fullDate;
        tempObject.startDate = nullCheck(fullDate.split('-')[0]).trim();
        tempObject.endDate = nullCheck(fullDate.split('-')[1]).trim();
        tempObject.city = nullCheck(item.querySelector("div.city > span").innerHTML);
        tempObject.district = nullCheck(item.querySelector("div.district > span").innerHTML);

        // City
        if (nullCheck(tempObject.city) !== null && tempObject.city.includes(",")) {
            tempObject.city = tempObject.city.split(",").map((item) => item.trim());
        } else {
            tempObject.city = tempObject.city
        }

        // District
        if (nullCheck(tempObject.district) !== null && tempObject.district.includes(",")) {
            tempObject.district = tempObject.district.split(",").map((item) => item.trim());
        } else {
            tempObject.district = tempObject.district;
        }

        tempObject.serviceType = nullCheck(item.querySelector("div.service-type > span").innerHTML);
        tempObject.description = nullCheck(item.querySelector("div.desc > span").innerHTML);
        tempArray.push(tempObject);
    });
    return tempArray;
}

export const gibirParser = (data) => {
    const dom = new JSDOM(data);
    const document = dom.window.document;

    // Desktop view table'ı bul
    let tempData = document.querySelector("table tbody");
    if (!tempData) {
        // Fallback: eski yapı
        tempData = document.querySelector("tbody#notification-filter-list");
    }

    if (!tempData) return [];

    const rows = tempData.querySelectorAll("tr");
    let tempArray = [];

    rows.forEach((item, index) => {
        try {
            let tempObject = {};

            // Tarih parse fonksiyonu (örn: "20 Oca 2026, 00:00" -> ISO date)
            const parseGibirDate = (dateStr) => {
                if (!dateStr) return null;

                const monthMap = {
                    'Oca': '01', 'Şub': '02', 'Mar': '03', 'Nis': '04',
                    'May': '05', 'Haz': '06', 'Tem': '07', 'Ağu': '08',
                    'Eyl': '09', 'Eki': '10', 'Kas': '11', 'Ara': '12'
                };

                // "20 Oca 2026, 00:00" formatı
                const match = dateStr.trim().match(/(\d+)\s+(\w+)\s+(\d{4}),\s+(\d{2}):(\d{2})/);
                if (match) {
                    const [, day, month, year, hour, minute] = match;
                    const monthNum = monthMap[month] || '01';
                    return new Date(`${year}-${monthNum}-${day.padStart(2, '0')}T${hour}:${minute}:00.000Z`);
                }
                return null;
            };

            const td1 = item.querySelector("td:nth-child(1)");
            const td2 = item.querySelector("td:nth-child(2)");
            const td3 = item.querySelector("td:nth-child(3)");
            const td4 = item.querySelector("td:nth-child(4)");

            if (!td1 || !td2 || !td3 || !td4) return;

            tempObject.id = index + 1;
            tempObject.startDate = parseGibirDate(td1.textContent);
            tempObject.endDate = parseGibirDate(td2.textContent);
            tempObject.description = nullCheck(td3.textContent);

            // Durum badge'inden text al
            const statusBadge = td4.querySelector("div");
            tempObject.status = nullCheck(statusBadge ? statusBadge.textContent : td4.textContent); // Beklemede, Düzeltildi

            tempArray.push(tempObject);
        } catch (err) {
            console.error(`Error parsing row ${index}:`, err);
        }
    });
    return tempArray;
}

export const turkcellParser = (data) => {
    /*
    {"city":["ISTANBUL"],"district":["SISLI"],"startTime":"2025-02-05T02:00:00","endTime":"2025-02-05T06:00:00","descServiceName":["Data"]},
    ISTANBUL ilinden hizmet alan müşterilerimize daha iyi hizmet verebilmek için Ses, Data servisimizde çalışma planlanmıştır. Bazı müşterilerimizin kısa süreli servis kesintileri yaşaması öngörülmektedir.
    getPlannedWork
    */
    let tempData = [];

    data.forEach((item) => {
        let tempObject = {};
        tempObject.city = item?.city;
        tempObject.district = item?.district;
        tempObject.startDate = item?.startTime;
        tempObject.endDate = item?.endTime;
        tempObject.serviceType = item?.descServiceName;
        tempObject.description = `${item?.city} ilinden hizmet alan müşterilerimize daha iyi hizmet verebilmek için ${item?.descServiceName} servisimizde çalışma planlanmıştır. Bazı müşterilerimizin kısa süreli servis kesintileri yaşaması öngörülmektedir.`;
        tempData.push(tempObject);
    });
    return tempData;
};

export const countryConverter = (countryCode) => {
    const countryList = {
        "AF": "Afghanistan",
        "AX": "Åland Islands",
        "AL": "Albania",
        "DZ": "Algeria",
        "AS": "American Samoa",
        "AD": "Andorra",
        "AO": "Angola",
        "AI": "Anguilla",
        "AQ": "Antarctica",
        "AG": "Antigua and Barbuda",
        "AR": "Argentina",
        "AM": "Armenia",
        "AW": "Aruba",
        "AU": "Australia",
        "AT": "Austria",
        "AZ": "Azerbaijan",
        "BS": "Bahamas",
        "BH": "Bahrain",
        "BD": "Bangladesh",
        "BB": "Barbados",
        "BY": "Belarus",
        "BE": "Belgium",
        "BZ": "Belize",
        "BJ": "Benin",
        "BM": "Bermuda",
        "BT": "Bhutan",
        "BO": "Bolivia (Plurinational State of)",
        "BQ": "Bonaire, Sint Eustatius and Saba",
        "BA": "Bosnia and Herzegovina",
        "BW": "Botswana",
        "BV": "Bouvet Island",
        "BR": "Brazil",
        "IO": "British Indian Ocean Territory",
        "BN": "Brunei Darussalam",
        "BG": "Bulgaria",
        "BF": "Burkina Faso",
        "BI": "Burundi",
        "CV": "Cabo Verde",
        "KH": "Cambodia",
        "CM": "Cameroon",
        "CA": "Canada",
        "KY": "Cayman Islands",
        "CF": "Central African Republic",
        "TD": "Chad",
        "CL": "Chile",
        "CN": "China",
        "CX": "Christmas Island",
        "CC": "Cocos (Keeling) Islands",
        "CO": "Colombia",
        "KM": "Comoros",
        "CG": "Congo",
        "CD": "Congo, Democratic Republic of the",
        "CK": "Cook Islands",
        "CR": "Costa Rica",
        "CI": "Côte d'Ivoire",
        "HR": "Croatia",
        "CU": "Cuba",
        "CW": "Curaçao",
        "CY": "Cyprus",
        "CZ": "Czechia",
        "DK": "Denmark",
        "DJ": "Djibouti",
        "DM": "Dominica",
        "DO": "Dominican Republic",
        "EC": "Ecuador",
        "EG": "Egypt",
        "SV": "El Salvador",
        "GQ": "Equatorial Guinea",
        "ER": "Eritrea",
        "EE": "Estonia",
        "SZ": "Eswatini",
        "ET": "Ethiopia",
        "FK": "Falkland Islands (Malvinas)",
        "FO": "Faroe Islands",
        "FJ": "Fiji",
        "FI": "Finland",
        "FR": "France",
        "GF": "French Guiana",
        "PF": "French Polynesia",
        "TF": "French Southern Territories",
        "GA": "Gabon",
        "GM": "Gambia",
        "GE": "Georgia",
        "DE": "Germany",
        "GH": "Ghana",
        "GI": "Gibraltar",
        "GR": "Greece",
        "GL": "Greenland",
        "GD": "Grenada",
        "GP": "Guadeloupe",
        "GU": "Guam",
        "GT": "Guatemala",
        "GG": "Guernsey",
        "GN": "Guinea",
        "GW": "Guinea-Bissau",
        "GY": "Guyana",
        "HT": "Haiti",
        "HM": "Heard Island and McDonald Islands",
        "VA": "Holy See",
        "HN": "Honduras",
        "HK": "Hong Kong",
        "HU": "Hungary",
        "IS": "Iceland",
        "IN": "India",
        "ID": "Indonesia",
        "IR": "Iran (Islamic Republic of)",
        "IQ": "Iraq",
        "IE": "Ireland",
        "IM": "Isle of Man",
        "IL": "Israel",
        "IT": "Italy",
        "JM": "Jamaica",
        "JP": "Japan",
        "JE": "Jersey",
        "JO": "Jordan",
        "KZ": "Kazakhstan",
        "KE": "Kenya",
        "KI": "Kiribati",
        "KP": "Korea (Democratic People's Republic of)",
        "KR": "Korea, Republic of",
        "KW": "Kuwait",
        "KG": "Kyrgyzstan",
        "LA": "Lao People's Democratic Republic",
        "LV": "Latvia",
        "LB": "Lebanon",
        "LS": "Lesotho",
        "LR": "Liberia",
        "LY": "Libya",
        "LI": "Liechtenstein",
        "LT": "Lithuania",
        "LU": "Luxembourg",
        "MO": "Macao",
        "MG": "Madagascar",
        "MW": "Malawi",
        "MY": "Malaysia",
        "MV": "Maldives",
        "ML": "Mali",
        "MT": "Malta",
        "MH": "Marshall Islands",
        "MQ": "Martinique",
        "MR": "Mauritania",
        "MU": "Mauritius",
        "YT": "Mayotte",
        "MX": "Mexico",
        "FM": "Micronesia (Federated States of)",
        "MD": "Moldova, Republic of",
        "MC": "Monaco",
        "MN": "Mongolia",
        "ME": "Montenegro",
        "MS": "Montserrat",
        "MA": "Morocco",
        "MZ": "Mozambique",
        "MM": "Myanmar",
        "NA": "Namibia",
        "NR": "Nauru",
        "NP": "Nepal",
        "NL": "Netherlands",
        "NC": "New Caledonia",
        "NZ": "New Zealand",
        "NI": "Nicaragua",
        "NE": "Niger",
        "NG": "Nigeria",
        "NU": "Niue",
        "NF": "Norfolk Island",
        "MK": "North Macedonia",
        "MP": "Northern Mariana Islands",
        "NO": "Norway",
        "OM": "Oman",
        "PK": "Pakistan",
        "PW": "Palau",
        "PS": "Palestine, State of",
        "PA": "Panama",
        "PG": "Papua New Guinea",
        "PY": "Paraguay",
        "PE": "Peru",
        "PH": "Philippines",
        "PN": "Pitcairn",
        "PL": "Poland",
        "PT": "Portugal",
        "PR": "Puerto Rico",
        "QA": "Qatar",
        "RE": "Réunion",
        "RO": "Romania",
        "RU": "Russian Federation",
        "RW": "Rwanda",
        "BL": "Saint Barthélemy",
        "SH": "Saint Helena, Ascension and Tristan da Cunha",
        "KN": "Saint Kitts and Nevis",
        "LC": "Saint Lucia",
        "MF": "Saint Martin (French part)",
        "PM": "Saint Pierre and Miquelon",
        "VC": "Saint Vincent and the Grenadines",
        "WS": "Samoa",
        "SM": "San Marino",
        "ST": "Sao Tome and Principe",
        "SA": "Saudi Arabia",
        "SN": "Senegal",
        "RS": "Serbia",
        "SC": "Seychelles",
        "SL": "Sierra Leone",
        "SG": "Singapore",
        "SX": "Sint Maarten (Dutch part)",
        "SK": "Slovakia",
        "SI": "Slovenia",
        "SB": "Solomon Islands",
        "SO": "Somalia",
        "ZA": "South Africa",
        "GS": "South Georgia and the South Sandwich Islands",
        "SS": "South Sudan",
        "ES": "Spain",
        "LK": "Sri Lanka",
        "SD": "Sudan",
        "SR": "Suriname",
        "SJ": "Svalbard and Jan Mayen",
        "SE": "Sweden",
        "CH": "Switzerland",
        "SY": "Syrian Arab Republic",
        "TW": "Taiwan, Province of China",
        "TJ": "Tajikistan",
        "TZ": "Tanzania, United Republic of",
        "TH": "Thailand",
        "TL": "Timor-Leste",
        "TG": "Togo",
        "TK": "Tokelau",
        "TO": "Tonga",
        "TT": "Trinidad and Tobago",
        "TN": "Tunisia",
        "TR": "Turkey",
        "TM": "Turkmenistan",
        "TC": "Turks and Caicos Islands",
        "TV": "Tuvalu",
        "UG": "Uganda",
        "UA": "Ukraine",
        "AE": "United Arab Emirates",
        "GB": "United Kingdom of Great Britain and Northern Ireland",
        "US": "United States of America",
        "UM": "United States Minor Outlying Islands",
        "UY": "Uruguay",
        "UZ": "Uzbekistan",
        "VU": "Vanuatu",
        "VE": "Venezuela (Bolivarian Republic of)",
        "VN": "Viet Nam",
        "VG": "Virgin Islands (British)",
        "VI": "Virgin Islands (U.S.)",
        "WF": "Wallis and Futuna",
        "EH": "Western Sahara",
        "YE": "Yemen",
        "ZM": "Zambia",
        "ZW": "Zimbabwe"
    }
    return countryList[countryCode]
}