import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

dayjs.extend(relativeTime);
dayjs.extend(duration);

class Day {
  static getFuzzyTimestampWithEpoch(epoch) {
    let retval = "N/A";

    if (epoch !== undefined) {
      const dt = dayjs(epoch * 1000);
      const now = dayjs();
      const diffInSeconds = now.diff(dt, 'second');

      if (diffInSeconds >= 31536000) {
        retval = `${Math.floor(diffInSeconds / 31536000)}Y ago`;
      } else if (diffInSeconds >= 2592000) {
        retval = `${Math.floor(diffInSeconds / 2592000)}M ago`;
      } else if (diffInSeconds >= 86400) {
        retval = `${Math.floor(diffInSeconds / 86400)}D ago`;
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
}

export default Day;
