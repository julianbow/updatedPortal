import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(utc);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

class Day {
  static formatTimestamp(timestamp) {
    return dayjs(timestamp).format('MM/DD/YY h:mm A');
  }

  static getUTCLongDate(timestamp) {
    if (timestamp !== undefined) {
      const dt = dayjs.utc(timestamp);
      return dt.format("M/D/YY h:mm:ss a");
    }
    return "---";
  }

  static getUTCDate(timestamp) {
    if (timestamp !== undefined && timestamp !== null) {
      const dt = dayjs.utc(timestamp);
      return dt.format("M/D/YY h:mm a");
    }
    return "---";
  }

  static getUTC(timestamp) {
    if (timestamp !== undefined && timestamp !== null) {
      return dayjs(timestamp).utc().valueOf();
    }
  }

  static getHoursBetweenDates(start, end) {
    start = this.getValue(start);
    end = this.getValue(end);

    if (start !== "" && end !== "") {
      const startDT = dayjs(start);
      const endDT = dayjs(end);
      const diff = endDT.diff(startDT);
      const durationInHours = dayjs.duration(diff).asHours();
      return Math.floor(durationInHours);
    }

    return "---";
  }

  static getFuzzyTimestampWithEpoch(epoch) {
    let retval = "N/A";

    if (epoch !== undefined && epoch !== null) {
      const dt = dayjs(epoch * 1000);
      const now = dayjs();
      const diffInSeconds = now.diff(dt, 'second');

      if (diffInSeconds >= 31536000) {
        retval = `${Math.floor(diffInSeconds / 31536000)}Y ago`;
      } else if (diffInSeconds >= 2592000) {
        retval = `${Math.floor(diffInSeconds / 2592000)}M ago`;
      } else if (diffInSeconds >= 86400) {
        retval = `${Math.floor(diffInSeconds / 86400)}d ago`;
      } else if (diffInSeconds >= 3600) {
        retval = `${Math.floor(diffInSeconds / 3600)}h ago`;
      } else if (diffInSeconds >= 60) {
        retval = `${Math.floor(diffInSeconds / 60)}m ago`;
      } else {
        retval = `${diffInSeconds}s ago`;
      }
    }

    return retval;
  }

  static getFormattedLongDate(epoch) {
    if (epoch !== undefined && epoch !== null) {
      return dayjs.unix(epoch).format('dddd, MMMM Do YYYY');
    }
    return "---";
  }

  static getStationTimeWithTZ(timestamp) {
    return dayjs.unix(timestamp).format('h:mm a z');
  }

  // Format timestamp to browser's local timezone
  static getBrowserTimeWithTZ(timestamp) {
    return dayjs.unix(timestamp).local().format('h:mm a z');
  }

  // Format timestamp to UTC timezone
  static getUTCTimeWithTZ(timestamp) {
    return dayjs.unix(timestamp).utc().format('h:mm a UTC');
  }

  static getUTCTimeDateWithTZ(timestamp) {
    return dayjs.unix(timestamp).utc().format('M/D/YY h:mm a UTC');
  }

  static getFormattedTimeWithZone(timestamp, timeZone) {
    if (timestamp !== undefined && timestamp !== null) {
      return dayjs.unix(timestamp).tz(timeZone).format('h:mm a z');
    }
    return "---";
  }

  static getValue(value) {
    return value || "";
  }
}

export default Day;
