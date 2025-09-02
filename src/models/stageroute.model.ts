import mongoose, { Schema, Model, Document } from 'mongoose';

export type StopData = {
  name: string;
  lat: number;
  lng: number;
};

type StageRouteDocument = Document & {
  name: string;
  source: StopData;
  terminus: StopData;
  stops: StopData[];
  sacco: string | null;
};

type StageRouteInput = {
  name: StageRouteDocument['name'];
  source: StageRouteDocument['source'];
  terminus: StageRouteDocument['terminus'];
  stops: StageRouteDocument['stops'];
  sacco: StageRouteDocument['sacco'];
};

const stageRouteSchema = new Schema(
  {
    name: {
      type: Schema.Types.String,
      required: true,
      // unique: true,
    },
    source: {
      type: Schema.Types.Map,
      default: null,
    },
    terminus: {
      type: Schema.Types.Map,
      default: null,
    },
    stops: {
      type: Schema.Types.Array,
      default: null,
    },
    sacco: {
      type: Schema.Types.String,
      default: null,
    },
    enabled: {
      type: Schema.Types.Boolean,
      default: true,
    },
  },
  {
    collection: 'stageRoutes',
    timestamps: true,
  },
);

const StageRoute: Model<StageRouteDocument> = mongoose.model<StageRouteDocument>('StageRoute', stageRouteSchema);

export { StageRoute, StageRouteInput, StageRouteDocument };
