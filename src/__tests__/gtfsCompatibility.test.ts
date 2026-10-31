import { describe, expect, it } from 'vitest';
import { transit_realtime } from '@golemio/ovapi-gtfs-realtime-bindings';

/**
 * Encoded with Google's gtfs-realtime-bindings 2.2.0 before replacing its
 * runtime dependency. This tests interoperable GTFS-RT wire tags rather than
 * just encoding and decoding with the same implementation. Times are fixed.
 */
const GOOGLE_GTFS_FIXTURE = 'CgsKAzIuMBjgxprXBhJYCgl2ZWhpY2xlLTEiSwoPCgZ0cmlwLTEqA1JlZDABEhQNajwpQhW+H47CHQAANEMtZmYOQSACKODGmtcGOgtwbGFjZS1mbGRjckILCgN2LTESBDAxNDJIARJJCgZ0cmlwLTEaPwoPCgZ0cmlwLTEqA1JlZDABEiwSCAh4ELjLmtcGGgYQ9Mua1wYiC3BsYWNlLWZsZGNyKAEyCRIHQXNobW9udBJ+CgdhbGVydC0xKnMKDAjgxprXBhDw4prXBioSEgNSZWQqC3BsYWNlLWZsZGNyOANCHQobChVodHRwczovL3d3dy5tYnRhLmNvbS8SAmVuUhUKEwoNU2VydmljZSBhbGVydBICZW5aFQoTCg1FeHBlY3QgZGVsYXlzEgJlbnAD';

describe('GTFS realtime binding compatibility', () => {
  it('decodes original Google-binding vehicle, prediction and alert fields', () => {
    const message = transit_realtime.FeedMessage.decode(Buffer.from(GOOGLE_GTFS_FIXTURE, 'base64'));
    expect(message.header.gtfsRealtimeVersion).toBe('2.0');
    expect(Number(message.header.timestamp)).toBe(1_793_500_000);
    const [vehicle, trip, alert] = message.entity;
    expect(vehicle.vehicle?.trip).toMatchObject({ tripId: 'trip-1', routeId: 'Red', directionId: 1 });
    expect(vehicle.vehicle?.position?.latitude).toBeCloseTo(42.309);
    expect(vehicle.vehicle?.position?.longitude).toBeCloseTo(-71.062);
    expect(vehicle.vehicle).toMatchObject({ stopId: 'place-fldcr', currentStatus: 2, occupancyStatus: 1 });
    expect(vehicle.vehicle?.vehicle?.label).toBe('0142');
    const stop = trip.tripUpdate?.stopTimeUpdate?.[0];
    expect(stop).toMatchObject({ stopId: 'place-fldcr', scheduleRelationship: 1 });
    expect(Number(stop?.arrival?.time)).toBe(1_793_500_600);
    expect(stop?.stopTimeProperties?.stopHeadsign).toBe('Ashmont');
    expect(alert.alert).toMatchObject({ effect: 3, severityLevel: 3 });
    expect(alert.alert?.informedEntity?.[0]).toMatchObject({ routeId: 'Red', stopId: 'place-fldcr' });
    expect(alert.alert?.headerText?.translation?.[0].text).toBe('Service alert');
    expect(alert.alert?.descriptionText?.translation?.[0].text).toBe('Expect delays');
    expect(alert.alert?.url?.translation?.[0].text).toBe('https://www.mbta.com/');
  });
});
