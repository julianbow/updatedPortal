import axios from 'axios';
import { apiKey, apiKey2, apiKey3 } from '../../config.json'
class Requestor {
  constructor(settings = {}) {
    const defaultSettings = {
      apiKey: apiKey,
      apiKey2: apiKey2,
      apiKey3: apiKey3,
      baseUrl: 'https://swd.weatherflow.com/swd/rest/',
      baseUrl2: 'http://iot.weatherflow.com/metrics/rest/',
      baseUrl3: 'https://development-swd.weatherflow.com/',
    };

    this.settings = { ...defaultSettings, ...settings };
  }

  makePostRequest(endPoint, urlData) {
    const url = `${this.settings.baseUrl}${endPoint}?api_key=${this.settings.apiKey}`;
    return axios.post(url, urlData);
  }

  makePostRequestDevCSV(endPoint, formData) {
    const url = `${this.settings.baseUrl3}${endPoint}?api_key=${this.settings.apiKey2}`;
    return axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  makePutRequest(endPoint, urlData) {
    const url = `${this.settings.baseUrl}${endPoint}?api_key=${this.settings.apiKey}&${new URLSearchParams(urlData).toString()}`;
    return axios.put(url);
  }

  makePutRequestDev(endPoint, data) {
    const url = `${this.settings.baseUrl3}${endPoint}?api_key=${this.settings.apiKey2}`;
    return axios.put(url, data);
  }

  makeDeleteRequest(endPoint, urlData) {
    const url = `${this.settings.baseUrl}${endPoint}?api_key=${this.settings.apiKey}&${new URLSearchParams(urlData).toString()}`;
    return axios.delete(url);
  }

  makeGetRequest(endPoint, urlData) {
    const url = `${this.settings.baseUrl}${endPoint}?api_key=${this.settings.apiKey}&${new URLSearchParams(urlData).toString()}`;
    return axios.get(url);
  }

  async makeAsyncGetRequest(endPoint, urlData) {
    const url = `${this.settings.baseUrl}${endPoint}?api_key=${this.settings.apiKey}&${new URLSearchParams(urlData).toString()}`;
    const response = await axios.get(url);
    return response.data;
  }

  makeGetRequestMetric(endPoint, urlData) {
    const url = `${this.settings.baseUrl2}${endPoint}?api_key=${this.settings.apiKey}&${new URLSearchParams(urlData).toString()}`;
    return axios.get(url);
  }

  makeOAuthIdGetRequest(endPoint, urlData) {
    const url = `${this.settings.baseUrl3}swd/rest/${endPoint}${urlData}?api_key=${this.settings.apiKey2}`;
    return axios.get(url);
  }

  makeTempestInternalGetRequest(endPoint, urlData) {
    const url = `${this.settings.baseUrl3}${endPoint}?api_key=${this.settings.apiKey2}&${new URLSearchParams(urlData).toString()}`;
    return axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'json',
    });
  }

  makeGetRequestDev(endPoint, urlData, includeSwd = false) {
    const url = `${this.settings.baseUrl3}${includeSwd ? 'swd/rest/' : ''}${endPoint}?api_key=${this.settings.apiKey3}&${new URLSearchParams(urlData).toString()}`;
    return axios.get(url);
  }

  makeGetRequestWithNoAPIKey(endPoint, urlData) {
    const url = `${this.settings.baseUrl}${endPoint}`;
    return axios.get(url, { params: urlData });
  }
}

export default Requestor;