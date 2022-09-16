import zlib from 'zlib'
import { pipeline } from 'stream';
import fs from 'fs'
import { Logger } from './Logger';
import { Level } from '../enums/Level';

export class GZip {
    public static compress(data: string, writePath: string) {
        pipeline(data, zlib.createGzip(), fs.createWriteStream(writePath), (error) => {
            if (error) {
                Logger.print(error, {
                    level: Level.Error,
                    tagSets: [{key: "zlib", value: "createGzip"}]
                })
            }
        });
    }

    public static decompress(readPath: string, writePath: string) {
        pipeline(fs.createReadStream(readPath), zlib.createUnzip(), fs.createWriteStream(writePath), (error) => {
            if (error) {
                Logger.print(error, {
                    level: Level.Error,
                    tagSets: [{key: "zlib", value: "createGunzip"}]
                })
              }
        })
    }
}
