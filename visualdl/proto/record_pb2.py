# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: record.proto

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor.FileDescriptor(
  name='record.proto',
  package='visualdl',
  syntax='proto3',
  serialized_options=None,
  serialized_pb=b'\n\x0crecord.proto\x12\x08visualdl\"\xc6\x05\n\x06Record\x12&\n\x06values\x18\x01 \x03(\x0b\x32\x16.visualdl.Record.Value\x1a%\n\x05Image\x12\x1c\n\x14\x65ncoded_image_string\x18\x04 \x01(\x0c\x1a}\n\x05\x41udio\x12\x13\n\x0bsample_rate\x18\x01 \x01(\x02\x12\x14\n\x0cnum_channels\x18\x02 \x01(\x03\x12\x15\n\rlength_frames\x18\x03 \x01(\x03\x12\x1c\n\x14\x65ncoded_audio_string\x18\x04 \x01(\x0c\x12\x14\n\x0c\x63ontent_type\x18\x05 \x01(\t\x1a+\n\tEmbedding\x12\r\n\x05label\x18\x01 \x01(\t\x12\x0f\n\x07vectors\x18\x02 \x03(\x02\x1a<\n\nEmbeddings\x12.\n\nembeddings\x18\x01 \x03(\x0b\x32\x1a.visualdl.Record.Embedding\x1a\x43\n\x10\x62ytes_embeddings\x12\x16\n\x0e\x65ncoded_labels\x18\x01 \x01(\x0c\x12\x17\n\x0f\x65ncoded_vectors\x18\x02 \x01(\x0c\x1a\x34\n\tHistogram\x12\x10\n\x04hist\x18\x01 \x03(\x01\x42\x02\x10\x01\x12\x15\n\tbin_edges\x18\x02 \x03(\x01\x42\x02\x10\x01\x1a\x87\x02\n\x05Value\x12\n\n\x02id\x18\x01 \x01(\x03\x12\x0b\n\x03tag\x18\x02 \x01(\t\x12\x11\n\ttimestamp\x18\x03 \x01(\x03\x12\x0f\n\x05value\x18\x04 \x01(\x02H\x00\x12\'\n\x05image\x18\x05 \x01(\x0b\x32\x16.visualdl.Record.ImageH\x00\x12\'\n\x05\x61udio\x18\x06 \x01(\x0b\x32\x16.visualdl.Record.AudioH\x00\x12\x31\n\nembeddings\x18\x07 \x01(\x0b\x32\x1b.visualdl.Record.EmbeddingsH\x00\x12/\n\thistogram\x18\x08 \x01(\x0b\x32\x1a.visualdl.Record.HistogramH\x00\x42\x0b\n\tone_valueb\x06proto3'
)




_RECORD_IMAGE = _descriptor.Descriptor(
  name='Image',
  full_name='visualdl.Record.Image',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='encoded_image_string', full_name='visualdl.Record.Image.encoded_image_string', index=0,
      number=4, type=12, cpp_type=9, label=1,
      has_default_value=False, default_value=b"",
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=77,
  serialized_end=114,
)

_RECORD_AUDIO = _descriptor.Descriptor(
  name='Audio',
  full_name='visualdl.Record.Audio',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='sample_rate', full_name='visualdl.Record.Audio.sample_rate', index=0,
      number=1, type=2, cpp_type=6, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='num_channels', full_name='visualdl.Record.Audio.num_channels', index=1,
      number=2, type=3, cpp_type=2, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='length_frames', full_name='visualdl.Record.Audio.length_frames', index=2,
      number=3, type=3, cpp_type=2, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='encoded_audio_string', full_name='visualdl.Record.Audio.encoded_audio_string', index=3,
      number=4, type=12, cpp_type=9, label=1,
      has_default_value=False, default_value=b"",
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='content_type', full_name='visualdl.Record.Audio.content_type', index=4,
      number=5, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=116,
  serialized_end=241,
)

_RECORD_EMBEDDING = _descriptor.Descriptor(
  name='Embedding',
  full_name='visualdl.Record.Embedding',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='label', full_name='visualdl.Record.Embedding.label', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='vectors', full_name='visualdl.Record.Embedding.vectors', index=1,
      number=2, type=2, cpp_type=6, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=243,
  serialized_end=286,
)

_RECORD_EMBEDDINGS = _descriptor.Descriptor(
  name='Embeddings',
  full_name='visualdl.Record.Embeddings',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='embeddings', full_name='visualdl.Record.Embeddings.embeddings', index=0,
      number=1, type=11, cpp_type=10, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=288,
  serialized_end=348,
)

_RECORD_BYTES_EMBEDDINGS = _descriptor.Descriptor(
  name='bytes_embeddings',
  full_name='visualdl.Record.bytes_embeddings',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='encoded_labels', full_name='visualdl.Record.bytes_embeddings.encoded_labels', index=0,
      number=1, type=12, cpp_type=9, label=1,
      has_default_value=False, default_value=b"",
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='encoded_vectors', full_name='visualdl.Record.bytes_embeddings.encoded_vectors', index=1,
      number=2, type=12, cpp_type=9, label=1,
      has_default_value=False, default_value=b"",
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=350,
  serialized_end=417,
)

_RECORD_HISTOGRAM = _descriptor.Descriptor(
  name='Histogram',
  full_name='visualdl.Record.Histogram',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='hist', full_name='visualdl.Record.Histogram.hist', index=0,
      number=1, type=1, cpp_type=5, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=b'\020\001', file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='bin_edges', full_name='visualdl.Record.Histogram.bin_edges', index=1,
      number=2, type=1, cpp_type=5, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=b'\020\001', file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=419,
  serialized_end=471,
)

_RECORD_VALUE = _descriptor.Descriptor(
  name='Value',
  full_name='visualdl.Record.Value',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='id', full_name='visualdl.Record.Value.id', index=0,
      number=1, type=3, cpp_type=2, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='tag', full_name='visualdl.Record.Value.tag', index=1,
      number=2, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='timestamp', full_name='visualdl.Record.Value.timestamp', index=2,
      number=3, type=3, cpp_type=2, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='value', full_name='visualdl.Record.Value.value', index=3,
      number=4, type=2, cpp_type=6, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='image', full_name='visualdl.Record.Value.image', index=4,
      number=5, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='audio', full_name='visualdl.Record.Value.audio', index=5,
      number=6, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='embeddings', full_name='visualdl.Record.Value.embeddings', index=6,
      number=7, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='histogram', full_name='visualdl.Record.Value.histogram', index=7,
      number=8, type=11, cpp_type=10, label=1,
      has_default_value=False, default_value=None,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
    _descriptor.OneofDescriptor(
      name='one_value', full_name='visualdl.Record.Value.one_value',
      index=0, containing_type=None, fields=[]),
  ],
  serialized_start=474,
  serialized_end=737,
)

_RECORD = _descriptor.Descriptor(
  name='Record',
  full_name='visualdl.Record',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='values', full_name='visualdl.Record.values', index=0,
      number=1, type=11, cpp_type=10, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[_RECORD_IMAGE, _RECORD_AUDIO, _RECORD_EMBEDDING, _RECORD_EMBEDDINGS, _RECORD_BYTES_EMBEDDINGS, _RECORD_HISTOGRAM, _RECORD_VALUE, ],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=27,
  serialized_end=737,
)

_RECORD_IMAGE.containing_type = _RECORD
_RECORD_AUDIO.containing_type = _RECORD
_RECORD_EMBEDDING.containing_type = _RECORD
_RECORD_EMBEDDINGS.fields_by_name['embeddings'].message_type = _RECORD_EMBEDDING
_RECORD_EMBEDDINGS.containing_type = _RECORD
_RECORD_BYTES_EMBEDDINGS.containing_type = _RECORD
_RECORD_HISTOGRAM.containing_type = _RECORD
_RECORD_VALUE.fields_by_name['image'].message_type = _RECORD_IMAGE
_RECORD_VALUE.fields_by_name['audio'].message_type = _RECORD_AUDIO
_RECORD_VALUE.fields_by_name['embeddings'].message_type = _RECORD_EMBEDDINGS
_RECORD_VALUE.fields_by_name['histogram'].message_type = _RECORD_HISTOGRAM
_RECORD_VALUE.containing_type = _RECORD
_RECORD_VALUE.oneofs_by_name['one_value'].fields.append(
  _RECORD_VALUE.fields_by_name['value'])
_RECORD_VALUE.fields_by_name['value'].containing_oneof = _RECORD_VALUE.oneofs_by_name['one_value']
_RECORD_VALUE.oneofs_by_name['one_value'].fields.append(
  _RECORD_VALUE.fields_by_name['image'])
_RECORD_VALUE.fields_by_name['image'].containing_oneof = _RECORD_VALUE.oneofs_by_name['one_value']
_RECORD_VALUE.oneofs_by_name['one_value'].fields.append(
  _RECORD_VALUE.fields_by_name['audio'])
_RECORD_VALUE.fields_by_name['audio'].containing_oneof = _RECORD_VALUE.oneofs_by_name['one_value']
_RECORD_VALUE.oneofs_by_name['one_value'].fields.append(
  _RECORD_VALUE.fields_by_name['embeddings'])
_RECORD_VALUE.fields_by_name['embeddings'].containing_oneof = _RECORD_VALUE.oneofs_by_name['one_value']
_RECORD_VALUE.oneofs_by_name['one_value'].fields.append(
  _RECORD_VALUE.fields_by_name['histogram'])
_RECORD_VALUE.fields_by_name['histogram'].containing_oneof = _RECORD_VALUE.oneofs_by_name['one_value']
_RECORD.fields_by_name['values'].message_type = _RECORD_VALUE
DESCRIPTOR.message_types_by_name['Record'] = _RECORD
_sym_db.RegisterFileDescriptor(DESCRIPTOR)

Record = _reflection.GeneratedProtocolMessageType('Record', (_message.Message,), {

  'Image' : _reflection.GeneratedProtocolMessageType('Image', (_message.Message,), {
    'DESCRIPTOR' : _RECORD_IMAGE,
    '__module__' : 'record_pb2'
    # @@protoc_insertion_point(class_scope:visualdl.Record.Image)
    })
  ,

  'Audio' : _reflection.GeneratedProtocolMessageType('Audio', (_message.Message,), {
    'DESCRIPTOR' : _RECORD_AUDIO,
    '__module__' : 'record_pb2'
    # @@protoc_insertion_point(class_scope:visualdl.Record.Audio)
    })
  ,

  'Embedding' : _reflection.GeneratedProtocolMessageType('Embedding', (_message.Message,), {
    'DESCRIPTOR' : _RECORD_EMBEDDING,
    '__module__' : 'record_pb2'
    # @@protoc_insertion_point(class_scope:visualdl.Record.Embedding)
    })
  ,

  'Embeddings' : _reflection.GeneratedProtocolMessageType('Embeddings', (_message.Message,), {
    'DESCRIPTOR' : _RECORD_EMBEDDINGS,
    '__module__' : 'record_pb2'
    # @@protoc_insertion_point(class_scope:visualdl.Record.Embeddings)
    })
  ,

  'bytes_embeddings' : _reflection.GeneratedProtocolMessageType('bytes_embeddings', (_message.Message,), {
    'DESCRIPTOR' : _RECORD_BYTES_EMBEDDINGS,
    '__module__' : 'record_pb2'
    # @@protoc_insertion_point(class_scope:visualdl.Record.bytes_embeddings)
    })
  ,

  'Histogram' : _reflection.GeneratedProtocolMessageType('Histogram', (_message.Message,), {
    'DESCRIPTOR' : _RECORD_HISTOGRAM,
    '__module__' : 'record_pb2'
    # @@protoc_insertion_point(class_scope:visualdl.Record.Histogram)
    })
  ,

  'Value' : _reflection.GeneratedProtocolMessageType('Value', (_message.Message,), {
    'DESCRIPTOR' : _RECORD_VALUE,
    '__module__' : 'record_pb2'
    # @@protoc_insertion_point(class_scope:visualdl.Record.Value)
    })
  ,
  'DESCRIPTOR' : _RECORD,
  '__module__' : 'record_pb2'
  # @@protoc_insertion_point(class_scope:visualdl.Record)
  })
_sym_db.RegisterMessage(Record)
_sym_db.RegisterMessage(Record.Image)
_sym_db.RegisterMessage(Record.Audio)
_sym_db.RegisterMessage(Record.Embedding)
_sym_db.RegisterMessage(Record.Embeddings)
_sym_db.RegisterMessage(Record.bytes_embeddings)
_sym_db.RegisterMessage(Record.Histogram)
_sym_db.RegisterMessage(Record.Value)


_RECORD_HISTOGRAM.fields_by_name['hist']._options = None
_RECORD_HISTOGRAM.fields_by_name['bin_edges']._options = None
# @@protoc_insertion_point(module_scope)
