import zlib from 'zlib'
import { pipeline } from 'stream';
import fs from 'fs'
import { Logger } from './Logger';
import { Level } from '../enums/Level';

export class GZip {
    public static async compress(data: string, writePath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            pipeline(data, zlib.createGzip(), fs.createWriteStream(writePath), (error) => {
                if (error) {
                    Logger.print(error, {
                        level: Level.Error,
                        tagSets: [{
                            key: "zlib", 
                            value: "createGzip"
                        }]
                    })
                    reject(error)
                }

                resolve(true)
            });
        })
    }

    public static async decompress(readPath: string, writePath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            pipeline(fs.createReadStream(readPath), zlib.createUnzip(), fs.createWriteStream(writePath), (error) => {
                if (error) {
                    Logger.print(error, {
                        level: Level.Error,
                        tagSets: [{
                            key: "zlib", 
                            value: "createUnzip"
                        }]
                    })
                    reject(error)
                }

                resolve(true)
            })
        })
    }
}
