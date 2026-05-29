import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { PdfExtractorService } from './pdf-extractor.service';
import { ArchiveOrgFetcherService } from './archive-org-fetcher.service';
import { GutenbergFetcherService } from './gutenberg-fetcher.service';
import { PdfIngesterService } from './pdf-ingester.service';

@Module({
  imports: [PrismaModule],
  providers: [
    PdfExtractorService,
    ArchiveOrgFetcherService,
    GutenbergFetcherService,
    PdfIngesterService,
  ],
  exports: [PdfIngesterService, PdfExtractorService],
})
export class PdfModule {}
