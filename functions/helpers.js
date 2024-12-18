// Constant: functions/helpers.js
import { JSDOM } from "jsdom";
const languageCode = "tr-TR";
const timeZoneString = "Europe/Istanbul";

String.prototype.dateConverter = function() {
    return new Date(this.replace(/(\d+)\.(\d+)\.(\d+)\s(\d+):(\d+):(\d+)/, "$3-$2-$1T$4:$5:$6.000Z"));
};

const replaceAll = (str, find, replace) => {
    var target = str
    return target.replace(new RegExp(find, 'g'), replace);
}

const nullCheck = (value) => {
    if(typeof value === "string"){
        value = value.trim()
        value.replace(/(\r\n|\n|\r)/gm, "");
        // 2 space conver to 1 space
        value = value.replace(/  +/g, ' ');
    }
    return (value === null || value === undefined || value === "" || value === "null" || value === "undefined" || value === "NaN" || value === NaN || value === " " || value === '-') ? null : value;
}

const booleanParser = (data) => {
    if(typeof data === "string"){
        data = data.trim()
        data = parseInt(data)
    }
    if(typeof data === "boolean"){
        return data
    }

    return (data === 1) ? true : false;
};

const unicodeToString = (text) => {
    text = nullCheck(text)
    if(text != null) return text.replace(/\\u[\dA-F]{4}/gi, 
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
    if(typeof status === "string" || status === null || status === ""){
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
    if(typeof status === "string" || status === null || status === ""){
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
    String.prototype.replaceAll = function(search, replacement) {
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
        if(nullCheck(tempObject.city) !== null && tempObject.city.includes(",")){
            tempObject.city = tempObject.city.split(",").map((item) => item.trim());
        }else{
            tempObject.city = tempObject.city
        }

        // District
        if(nullCheck(tempObject.district) !== null && tempObject.district.includes(",")){
            tempObject.district = tempObject.district.split(",").map((item) => item.trim());
        }else{
            tempObject.district = tempObject.district;
        }

        tempObject.serviceType = nullCheck(item.querySelector("div.service-type > span").innerHTML);
        tempObject.description = nullCheck(item.querySelector("div.desc > span").innerHTML);
        tempArray.push(tempObject);
    });
    return tempArray;
}

export const gibirParser = (data) => {
    let tempData = new JSDOM(data).window.document.querySelector("tbody#notification-filter-list");
    tempData = tempData.querySelectorAll("tr");
    let tempArray = [];

    tempData.forEach((item) => {
        let tempObject = {};
        tempObject.id = parseInt(item.querySelector("td:nth-child(1) > span.plan-num").innerHTML);
        tempObject.startDate = (item.querySelector("td:nth-child(1)").innerHTML.split("</span>")[1]).dateConverter();
        tempObject.endDate = (item.querySelector("td:nth-child(2)").innerHTML).dateConverter();
        tempObject.description = item.querySelector("td:nth-child(3)").innerHTML;
        tempObject.status = item.querySelector("td:nth-child(4)").innerHTML; // Beklemede, Düzeltildi
        tempArray.push(tempObject);
    });
    return tempArray;
}

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