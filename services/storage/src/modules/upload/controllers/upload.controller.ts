import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Request,
  Delete,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "../services/upload.service";
import CustomRequest from "src/common/interfaces/request.interface";
import ORIGINMEDIA from "src/common/enums/media.enum";

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body("origin") origin: ORIGINMEDIA,
    @Body("bucket") bucket: string,
    @Request() request: CustomRequest
  ) {
    console.log(file);
    return await this.uploadService.save(
      request.database,
      origin,
      file,
      null,
      "bucket"
    );
  }

  @Delete()
  async deleteMedia(
    @Body("origin") origin: string,
    @Body("bucket") bucket: string
  ) {
    return await this.uploadService.deleteFile(origin, bucket);
  }
}
